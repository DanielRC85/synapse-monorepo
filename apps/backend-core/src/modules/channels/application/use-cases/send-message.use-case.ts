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
    // 1. Comunicación con el Proveedor Externo
    const response = await this.messagingAdapter.send({
      recipient: dto.recipient, // Asegúrate de que tu DTO tenga este campo (o 'to')
      content: dto.content,
      type: 'text',
    });

    // 2. Registro en el Historial Interno
    // AQUÍ ESTABA EL HUECO: Faltaba guardar el recipient y marcar isOutbound
    const message = Message.create({
      sender: 'ME', // Usamos 'ME' para que el Frontend sepa que fui yo (burbuja derecha)
      recipient: dto.recipient, // 👈 LA CURA: Guardamos a quién se lo enviamos
      content: dto.content,
      type: MessageType.TEXT,
      timestamp: new Date(),
      externalId: response.providerMessageId,
      tenantId: dto.tenantId,
      isOutbound: true, // 👈 IMPORTANTE: Marca que salió de nosotros
      hasMedia: false
    });

    await this.messageRepository.save(message);
    this.logger.log(`✅ Mensaje saliente guardado para: ${dto.recipient}`);
  }
}