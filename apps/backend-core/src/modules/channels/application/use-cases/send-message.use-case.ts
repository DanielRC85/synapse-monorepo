import { Inject, Injectable, Logger } from '@nestjs/common';
import { SendMessageDto } from '../dtos/send-message.dto';
import { Message, MessageType } from '../../domain/entities/message.entity';

// ⚠️ CORRECCIÓN 1: Separamos el 'import type' (Interfaz) del 'import' (Valor/Token)
import type { MessageRepositoryPort } from '../../domain/ports/message.repository.port';
import { MESSAGE_REPOSITORY_PORT } from '../../domain/ports/message.repository.port';

import type { OutboundMessagingPort } from '../../domain/ports/outbound-messaging.port';
import { OUTBOUND_MESSAGING_PORT } from '../../domain/ports/outbound-messaging.port';

@Injectable()
export class SendMessageUseCase {
  private readonly logger = new Logger(SendMessageUseCase.name);

  constructor(
    @Inject(MESSAGE_REPOSITORY_PORT)
    private readonly messageRepository: MessageRepositoryPort, // Ahora es seguro usar el tipo aquí
    @Inject(OUTBOUND_MESSAGING_PORT)
    private readonly messagingAdapter: OutboundMessagingPort,
  ) {}

  async execute(dto: SendMessageDto): Promise<void> {
    // 1. Enviar mensaje a través del proveedor externo (Meta)
    const response = await this.messagingAdapter.send({
      recipient: dto.recipient,
      content: dto.content,
      type: 'text',
    });

    // 2. Crear entidad de dominio (Persistencia Local)
    // ⚠️ CORRECCIÓN 2: Usamos Message.create() en lugar de new Message()
    const message = Message.create({
      sender: 'ME', // Identificador de que fuimos nosotros
      content: dto.content,
      type: MessageType.TEXT,
      timestamp: new Date(),
      externalId: response.providerMessageId,
      tenantId: dto.tenantId,
      // direction: 'outbound' // Si agregaste este campo a la entidad, descoméntalo
    });

    // 3. Guardar en base de datos para historial
    await this.messageRepository.save(message);
    
    this.logger.log(`Mensaje Saliente Guardado: ${message.id} | WAMID: ${response.providerMessageId}`);
  }
}