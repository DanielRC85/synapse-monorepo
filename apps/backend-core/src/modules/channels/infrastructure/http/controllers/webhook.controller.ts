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

/**
 * Controlador encargado de gestionar la comunicación bidireccional con Meta.
 * Actúa como el punto de entrada (Inbound) para los eventos de WhatsApp Cloud API.
 */
@Controller('channels/messages')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly processUseCase: ProcessInboundMessageUseCase,
  ) {}

  /**
   * Endpoint de Verificación (Handshake).
   * Meta realiza una petición GET para validar la autenticidad del servidor mediante un Token.
   */
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    // Recuperamos el secreto desde la configuración global (Inyectado desde .env)
    const verifyToken = this.configService.get<string>('META_WEBHOOK_VERIFY_TOKEN');

    // Validación defensiva para asegurar que el servidor esté correctamente configurado
    if (!verifyToken) {
      this.logger.error('Error de Seguridad: El token de verificación no está definido en el entorno.');
      throw new ForbiddenException('Configuración de seguridad incompleta en el servidor.');
    }

    // Validación del handshake oficial de Meta
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook verificado exitosamente. Conexión establecida con Meta.');
      return challenge;
    }

    // Registro de intentos fallidos para auditoría de seguridad
    this.logger.warn(`Intento de conexión no autorizado. Token recibido: ${token}`);
    throw new ForbiddenException('El token de verificación proporcionado es inválido.');
  }

  /**
   * Endpoint de Recepción de Eventos (Callback).
   * Meta envía los mensajes y cambios de estado de WhatsApp mediante peticiones POST.
   */
  @Post()
  @HttpCode(HttpStatus.OK) // Forzamos 200 OK para evitar reintentos infinitos por parte de Meta
  async handleIncomingMessage(@Body() payload: any) {
    // Registro de traza para monitoreo de actividad
    this.logger.debug('Evento de Webhook recibido desde Meta.');

    try {
      // Delegación de la lógica de negocio al Caso de Uso correspondiente (Arquitectura Hexagonal)
      await this.processUseCase.execute(payload);
      
      this.logger.log('Notificación procesada y delegada al pipeline de mensajes.');
    } catch (error) {
      // Capturamos el error para registro interno sin interrumpir la respuesta hacia Meta
      // Esto evita bloqueos en la cuenta por fallos persistentes en el procesamiento
      this.logger.error(`Fallo en el procesamiento interno del mensaje: ${error.message}`, error.stack);
    }

    // Siempre retornamos confirmación de recepción a Meta
    return { status: 'received' };
  }
}