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

@Controller('channels/messages')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly processUseCase: ProcessInboundMessageUseCase,
  ) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const verifyToken = this.configService.get<string>('META_WEBHOOK_VERIFY_TOKEN');

    if (!verifyToken) {
      this.logger.error('Error de Seguridad: El token de verificación no está definido en el entorno.');
      throw new ForbiddenException('Configuración de seguridad incompleta en el servidor.');
    }

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('✅ Webhook verificado exitosamente. Conexión establecida con Meta.');
      return challenge;
    }

    this.logger.warn(`⚠️ Intento de conexión no autorizado. Token recibido: ${token}`);
    throw new ForbiddenException('El token de verificación proporcionado es inválido.');
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleIncomingMessage(@Body() payload: any) {
    // 🚨 DEBUG CRÍTICO: Imprime TODO el payload para análisis
    this.logger.debug('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.debug('📥 WEBHOOK PAYLOAD COMPLETO:');
    this.logger.debug(JSON.stringify(payload, null, 2));
    this.logger.debug('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Análisis de estructura
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    this.logger.debug(`🔍 Tipo de evento detectado: ${change?.field || 'DESCONOCIDO'}`);
    
    if (value?.messages) {
      this.logger.log('✅ MENSAJE DE TEXTO DETECTADO');
      this.logger.log(`📱 De: ${value.messages[0].from}`);
      this.logger.log(`💬 Contenido: ${value.messages[0].text?.body || '[No text]'}`);
    } else if (value?.statuses) {
      this.logger.debug('📊 Status update recibido (no es mensaje de texto)');
      this.logger.debug(`Estado: ${value.statuses[0].status}`);
    } else {
      this.logger.warn('⚠️ Estructura de payload no reconocida');
    }

    try {
      await this.processUseCase.execute(payload);
      this.logger.log('✅ Notificación procesada exitosamente');
    } catch (error) {
      this.logger.error(`❌ Fallo en procesamiento: ${error.message}`, error.stack);
    }

    return { status: 'received' };
  }
}