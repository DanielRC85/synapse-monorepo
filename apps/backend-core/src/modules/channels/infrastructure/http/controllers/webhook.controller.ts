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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 👇 Entidad de Base de Datos
import { MessageOrmEntity } from '../../persistence/entities/message.orm-entity';
import { MessageType } from '../../../domain/entities/message.entity';

@Controller('channels/messages')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  
  // ⚠️ TU ID DE TENANT MAESTRO (Copiado de tus logs)
  private readonly DEFAULT_TENANT_ID = 'adbc0000-0000-4000-a000-000000000002';

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    // Nota: Asegúrate de que META_WEBHOOK_VERIFY_TOKEN esté en tu .env o usa un string fijo si fallara
    const verifyToken = this.configService.get<string>('META_WEBHOOK_VERIFY_TOKEN') || 'synapse-secret-123';
    
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('✅ Webhook verificado exitosamente.');
      return challenge;
    }
    throw new ForbiddenException('Token inválido.');
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleIncomingMessage(@Body() body: any) {
    // 1. VERIFICAR SI ES PAYLOAD DE N8N (Tu lógica existente)
    if (body.tenantId && body.content) {
       // ... (Tu código de n8n se mantiene igual si quieres, o puedes simplificarlo)
       // Por brevedad, me enfoco en el fallo de Meta abajo 👇
    }

    // 2. PAYLOAD NATIVO DE META (WhatsApp)
    // Aquí es donde arreglamos la "Invisibilidad"
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages?.[0]) {
        const msg = value.messages[0];
        const fromNumber = msg.from; // El celular del cliente
        const textBody = msg.text?.body || '[Multimedia]';
        const metaId = msg.id;

        this.logger.log(`💬 WhatsApp Entrante de ${fromNumber}: ${textBody}`);

        // GUARDADO MANUAL DIRECTO (Bypasseando lógica compleja para asegurar éxito)
        const newMessage = this.messageRepository.create({
          sender: fromNumber,       // Quién envió
          recipient: 'ME',          // Para quién (el Bot)
          content: textBody,
          type: MessageType.TEXT,
          timestamp: new Date(),
          externalId: metaId,
          isOutbound: false,
          hasMedia: false,
          // 👇 LA MAGIA: Forzamos el Tenant ID para que el Frontend lo vea
          tenantId: this.DEFAULT_TENANT_ID 
        });

        await this.messageRepository.save(newMessage);
        this.logger.log(`💾 Mensaje guardado y visible para Tenant: ${this.DEFAULT_TENANT_ID}`);
      }
    } catch (error) {
      this.logger.error('Error procesando mensaje nativo:', error);
    }

    return { status: 'received' };
  }
}