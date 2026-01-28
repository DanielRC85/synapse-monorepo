import { 
  Controller, 
  Get, 
  Post, 
  Query, 
  Body, 
  ForbiddenException, 
  Logger, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProcessInboundMessageUseCase } from '../../../application/use-cases/process-inbound-message.use-case';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 👇 Usamos la entidad de Base de Datos (ORM)
import { MessageOrmEntity } from '../../persistence/entities/message.orm-entity';

@Controller('channels/messages')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly processUseCase: ProcessInboundMessageUseCase,
    // 👇 Inyectamos el repositorio de la entidad ORM
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const verifyToken = this.configService.get<string>('META_WEBHOOK_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('✅ Webhook verificado exitosamente.');
      return challenge;
    }
    throw new ForbiddenException('Token inválido.');
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleIncomingMessage(@Body() payload: any) {
    this.logger.debug('📥 WEBHOOK PAYLOAD RECIBIDO');

    // 🛑 CASO 1: Viene de n8n (Payload Limpio)
    if (payload.tenantId && payload.content && payload.sender) {
      this.logger.log(`🚀 DETECTADO PAYLOAD N8N - Tenant: ${payload.tenantId}`);
      
      try {
        // 🛡️ LÓGICA DE SEGURIDAD PARA LA FECHA (¡Esto evita el error de Postgres!)
        let finalDate = new Date(); // Por defecto: Ahora mismo

        // Solo si viene timestamp y es un número válido, lo usamos
        if (payload.timestamp && !isNaN(Number(payload.timestamp))) {
            finalDate = new Date(Number(payload.timestamp) * 1000);
        }

        // Creamos el objeto compatible con la base de datos
        const newMessage = this.messageRepository.create({
            tenantId: payload.tenantId,
            content: payload.content,
            sender: payload.sender,
            type: payload.type || 'text',
            externalId: payload.externalId || `n8n_${Date.now()}`,
            timestamp: finalDate, // 👈 Usamos la fecha segura
            isOutbound: false,
            hasMedia: false
        });

        // Guardamos
        const saved = await this.messageRepository.save(newMessage);

        this.logger.log(`💾 MENSAJE GUARDADO EN DB (ID: ${saved.id})`);
        return { status: 'saved_n8n' };

      } catch (error) {
        this.logger.error(`❌ Error guardando mensaje de n8n: ${error.message}`);
        // No devolvemos error 500 para que n8n no reintente infinitamente si es un error de datos
        return { status: 'error', message: error.message };
      }
    }

    // 🛑 CASO 2: Payload nativo de Meta (Por si algún día quitas n8n)
    this.logger.debug('🔄 Procesando como payload nativo de Meta...');
    try {
      await this.processUseCase.execute(payload);
    } catch (error) {
       this.logger.warn('⚠️ No se pudo procesar el payload nativo (normal si usas n8n).');
    }

    return { status: 'received' };
  }
}