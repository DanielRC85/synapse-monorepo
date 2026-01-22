import { Inject, Injectable, Logger } from '@nestjs/common';
import { SendMessageDto } from '../dtos/send-message.dto';
import { Message, MessageType } from '../../domain/entities/message.entity';
import { MESSAGE_REPOSITORY_PORT } from '../../domain/ports/message.repository.port';
import type { MessageRepositoryPort } from '../../domain/ports/message.repository.port';
import { OUTBOUND_MESSAGING_PORT } from '../../domain/ports/outbound-messaging.port';
import type { OutboundMessagingPort } from '../../domain/ports/outbound-messaging.port';

@Injectable()
export class SendMessageUseCase {
  private readonly logger = new Logger(SendMessageUseCase.name);

  constructor(
    @Inject(MESSAGE_REPOSITORY_PORT)
    private readonly messageRepository: MessageRepositoryPort,
    @Inject(OUTBOUND_MESSAGING_PORT)
    private readonly messagingAdapter: OutboundMessagingPort,
  ) {}

  async execute(dto: SendMessageDto): Promise<void> {
    // 1. Comunicación con el Proveedor Externo (Puerto de Salida)
    const response = await this.messagingAdapter.send({
      recipient: dto.recipient,
      content: dto.content,
      type: 'text',
    });

    // 2. Registro en el Historial Interno tras confirmación del proveedor
    const message = Message.create({
      sender: 'SISTEMA', 
      content: dto.content,
      type: MessageType.TEXT,
      timestamp: new Date(),
      externalId: response.providerMessageId, // ID retornado por la API de Meta
      tenantId: dto.tenantId,
    });

    await this.messageRepository.save(message);
    this.logger.log(`Mensaje de salida registrado: ${response.providerMessageId}`);
  }
}