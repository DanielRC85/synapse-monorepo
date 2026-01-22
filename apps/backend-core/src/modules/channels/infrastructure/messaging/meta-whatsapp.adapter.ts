import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
// 👇 Importamos desde el archivo que acabamos de crear (Archivo A)
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
  private readonly GRAPH_API_VERSION = 'v21.0';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiToken = this.configService.getOrThrow<string>('META_ACCESS_TOKEN');
    this.phoneId = this.configService.getOrThrow<string>('META_PHONE_NUMBER_ID');
    this.apiUrl = `https://graph.facebook.com/${this.GRAPH_API_VERSION}/${this.phoneId}/messages`;
    
    this.logger.log(`Meta Adapter initialized. Phone ID: ${this.phoneId}`);
  }

  async send(payload: OutboundMessagePayload): Promise<OutboundMessageResponse> {
    try {
      const body = {
        messaging_product: 'whatsapp',
        to: payload.recipient,
        type: 'text',
        text: { body: payload.content },
      };

      this.logger.debug(`Sending message to: ${payload.recipient}`);

      const { data } = await firstValueFrom(
        this.httpService.post(this.apiUrl, body, {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      const metaMessageId = data.messages?.[0]?.id;
      this.logger.log(`Message sent. Meta ID: ${metaMessageId}`);

      return {
        providerMessageId: metaMessageId,
      };

    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  private handleAxiosError(error: any): never {
    const axiosError = error as AxiosError;
    const metaError = axiosError.response?.data as any;
    const errorMessage = metaError?.error?.message || axiosError.message;

    this.logger.error(
      `Meta API Failure: ${errorMessage}`,
      JSON.stringify(metaError || error.message)
    );
    
    throw new InternalServerErrorException(`WhatsApp sending failed: ${errorMessage}`);
  }
}