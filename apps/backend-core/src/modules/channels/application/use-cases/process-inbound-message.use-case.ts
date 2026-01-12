import { Inject, Injectable, Logger } from '@nestjs/common';
import { WhatsAppWebhookDto } from '../dtos/whatsapp-webhook.dto';
import { Message } from '../../domain/entities/message.entity';
// CORRECCIÓN AQUÍ: Separamos el valor (Symbol) del tipo (Interface)
import { MESSAGE_REPOSITORY_PORT } from '../../domain/ports/message.repository.port';
import type { MessageRepositoryPort } from '../../domain/ports/message.repository.port';

@Injectable()
export class ProcessInboundMessageUseCase {
  private readonly logger = new Logger(ProcessInboundMessageUseCase.name);

  constructor(
    @Inject(MESSAGE_REPOSITORY_PORT)
    private readonly messageRepository: MessageRepositoryPort,
  ) {}

  /**
   * Procesa un mensaje entrante asegurando idempotencia y persistencia.
   * @param dto Datos validados del webhook
   */
  async execute(dto: WhatsAppWebhookDto): Promise<void> {
    // 1. Verificación de Idempotencia (Critical Path)
    const existingMessage = await this.messageRepository.findByExternalId(dto.externalId);
    
    if (existingMessage) {
      this.logger.warn(`Mensaje duplicado ignorado: ${dto.externalId} (Tenant: ${dto.tenantId})`);
      return;
    }

    // 2. Mapeo a Dominio (Factory)
    // Nota: Asumimos timestamp en segundos (Unix estándar), convertimos a ms para Date
    const message = Message.create({
      sender: dto.sender,
      content: dto.content,
      type: dto.type,
      timestamp: new Date(dto.timestamp * 1000), 
      externalId: dto.externalId,
      tenantId: dto.tenantId,
    });

    // 3. Persistencia
    await this.messageRepository.save(message);
    
    this.logger.log(`Mensaje procesado y guardado: ${message.id} | Ext: ${dto.externalId}`);
  }
}