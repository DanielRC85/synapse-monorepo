import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { 
  OutboundMessagingPort, 
  OutboundMessagePayload, 
  OutboundMessageResponse 
} from '../../domain/ports/outbound-messaging.port';

/**
 * Adaptador de Infraestructura para la integración con Meta WhatsApp Cloud API.
 * Implementa el puerto de salida definido en el dominio para mantener el desacoplamiento tecnológico.
 */
@Injectable()
export class MetaWhatsAppAdapter implements OutboundMessagingPort {
  private readonly logger = new Logger(MetaWhatsAppAdapter.name);
  private readonly apiUrl: string;
  private readonly apiToken: string;
  private readonly phoneId: string;
  private readonly GRAPH_API_VERSION = 'v21.0'; // Versión estable de la API de Graph

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Inicialización segura: Se obtienen las credenciales desde las variables de entorno.
    // getOrThrow asegura que el sistema no arranque si falta configuración crítica.
    this.apiToken = this.configService.getOrThrow<string>('META_ACCESS_TOKEN');
    this.phoneId = this.configService.getOrThrow<string>('META_PHONE_NUMBER_ID');
    this.apiUrl = `https://graph.facebook.com/${this.GRAPH_API_VERSION}/${this.phoneId}/messages`;
    
    this.logger.log(`Meta Adapter inicializado correctamente para el Phone ID: ${this.phoneId}`);
  }

  /**
   * Ejecuta el envío de un mensaje de texto saliente hacia la API de Meta.
   * @param payload Información del destinatario y contenido del mensaje.
   */
  async send(payload: OutboundMessagePayload): Promise<OutboundMessageResponse> {
    try {
      const body = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: payload.recipient,
        type: 'text',
        text: { body: payload.content },
      };

      this.logger.debug(`Iniciando envío de mensaje saliente hacia: ${payload.recipient}`);

      // Ejecución de la petición HTTP mediante el cliente Axios de NestJS
      const { data } = await firstValueFrom(
        this.httpService.post(this.apiUrl, body, {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      const metaMessageId = data.messages?.[0]?.id;
      this.logger.log(`Mensaje enviado exitosamente. Identificador de Meta (WAMID): ${metaMessageId}`);

      return {
        providerMessageId: metaMessageId,
      };

    } catch (error) {
      // Delegación del error al manejador especializado para limpiar la traza
      this.handleAxiosError(error);
    }
  }

  /**
   * Procesa y estructura los errores provenientes de la API de Meta.
   * Evita exponer detalles sensibles y registra el fallo de forma técnica.
   */
  private handleAxiosError(error: any): never {
    const axiosError = error as AxiosError;
    const metaError = axiosError.response?.data as any;
    
    // Extracción del mensaje de error real devuelto por los servidores de Facebook
    const errorMessage = metaError?.error?.message || axiosError.message;
    const errorCode = metaError?.error?.code || 'N/A';

    this.logger.error(
      `Fallo en la API de Meta (Código: ${errorCode}): ${errorMessage}`,
      JSON.stringify(metaError || error.message)
    );
    
    // Lanzamos una excepción interna de NestJS para ser capturada por los filtros globales
    throw new InternalServerErrorException(`Fallo en la comunicación con WhatsApp: ${errorMessage}`);
  }
}