import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { 
  OutboundMessagingPort, 
  OutboundMessagePayload, 
  OutboundMessageResponse 
} from '../../domain/ports/outbound-messaging.port';

@Injectable()
export class MetaWhatsAppAdapter implements OutboundMessagingPort {
  private readonly logger = new Logger(MetaWhatsAppAdapter.name);
  private readonly apiUrl: string;
  private readonly apiToken: string;
  private readonly phoneId: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Asegúrate de que estas variables estén en tu .env
    this.apiToken = this.configService.getOrThrow<string>('META_API_TOKEN');
    this.phoneId = this.configService.getOrThrow<string>('META_PHONE_ID');
    this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneId}/messages`;
  }

  async send(payload: OutboundMessagePayload): Promise<OutboundMessageResponse> {
    try {
      const body = {
        messaging_product: 'whatsapp',
        to: payload.recipient,
        type: 'text',
        text: { body: payload.content },
      };

      const { data } = await firstValueFrom(
        this.httpService.post(this.apiUrl, body, {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return {
        providerMessageId: data.messages[0].id,
      };
    } catch (error) {
      this.logger.error(`Error Meta API: ${JSON.stringify(error?.response?.data || error.message)}`);
      throw new InternalServerErrorException('Error al enviar mensaje a WhatsApp');
    }
  }
}