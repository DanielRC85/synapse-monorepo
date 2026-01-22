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

  /**
   * ✅ 1. VERIFICACIÓN DEL WEBHOOK
   * Meta llama a este endpoint (GET) para confirmar que el servidor es nuestro.
   */
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    // 1. Extraer secreto de forma segura vía ConfigService
    const verifyToken = this.configService.get<string>('META_WEBHOOK_VERIFY_TOKEN');

    // 2. Validación de seguridad defensiva
    if (!verifyToken) {
      this.logger.error('❌ Error Crítico: META_WEBHOOK_VERIFY_TOKEN no está definido en las variables de entorno.');
      throw new ForbiddenException('Error de configuración del servidor');
    }

    // 3. Validación del handshake de Meta
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('✅ Conexión con Meta verificada exitosamente.');
      // NestJS maneja el retorno de string automáticamente con status 200
      return challenge;
    }

    // 4. Rechazo de intrusos
    this.logger.warn(`⚠️ Intento de verificación fallido. Token recibido: ${token}`);
    throw new ForbiddenException('Token de verificación inválido');
  }

  /**
   * 📩 2. RECEPCIÓN DE MENSAJES
   * Meta envía los mensajes de WhatsApp a este endpoint (POST).
   */
  @Post()
  @HttpCode(HttpStatus.OK) // Forzamos 200 OK siempre para que Meta no reintente en bucle si fallamos
  async handleIncomingMessage(@Body() payload: any) {
    // Log limpio para trazabilidad
    this.logger.debug('📩 Payload de Webhook recibido');

    try {
      // Delegamos la lógica al Caso de Uso (Clean Architecture)
      await this.processUseCase.execute(payload);
      
      this.logger.log('✅ Mensaje procesado y enviado al pipeline.');
    } catch (error) {
      // Capturamos el error pero NO dejamos que explote la respuesta HTTP a Meta
      this.logger.error(`❌ Error procesando mensaje entrante: ${error.message}`, error.stack);
      // Nota: Aún devolvemos 200 a Meta para confirmar recepción, el error es nuestro problema interno.
    }

    return { status: 'received' };
  }
}