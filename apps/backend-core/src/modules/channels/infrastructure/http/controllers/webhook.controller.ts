import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookSecretGuard } from '../guards/webhook-secret.guard';
import { WhatsAppWebhookDto } from '../../../application/dtos/whatsapp-webhook.dto';
import { ProcessInboundMessageUseCase } from '../../../application/use-cases/process-inbound-message.use-case';

@Controller('webhooks')
@UseGuards(WebhookSecretGuard)
export class WebhookController {
  constructor(
    private readonly processInboundMessageUseCase: ProcessInboundMessageUseCase,
  ) {}

  @Post('whatsapp')
  @HttpCode(HttpStatus.CREATED)
  async handleWebhook(@Body() dto: WhatsAppWebhookDto): Promise<{ status: string }> {
    // Delegamos la lógica al caso de uso de aplicación
    await this.processInboundMessageUseCase.execute(dto);
    
    return { status: 'received' };
  }
}