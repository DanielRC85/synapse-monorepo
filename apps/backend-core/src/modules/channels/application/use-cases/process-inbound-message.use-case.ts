import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message, MessageType } from '../../domain/entities/message.entity';
import { MESSAGE_REPOSITORY_PORT } from '../../domain/ports/message.repository.port';
import type { MessageRepositoryPort } from '../../domain/ports/message.repository.port';

@Injectable()
export class ProcessInboundMessageUseCase {
  private readonly logger = new Logger(ProcessInboundMessageUseCase.name);
  // UUID temporal para el entorno de desarrollo MVP
  private readonly MVP_DEV_TENANT_ID = 'adbc0000-0000-4000-a000-000000000002';

  constructor(
    @Inject(MESSAGE_REPOSITORY_PORT)
    private readonly messageRepository: MessageRepositoryPort,
  ) {}

  async execute(payload: any): Promise<void> {
    try {
      // Navegación segura en la estructura de datos de Meta
      const messageData = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!messageData) return;

      const externalId = messageData.id;

      // 1. Verificación de Idempotencia: Evita procesar mensajes ya registrados
      const existing = await this.messageRepository.findByExternalId(externalId);
      if (existing) {
        this.logger.warn(`Mensaje duplicado omitido: ${externalId}`);
        return;
      }

      // 2. Orquestación de la Entidad de Dominio
      const message = Message.create({
        sender: messageData.from,
        content: messageData.text?.body || '[Contenido no soportado]',
        type: MessageType.TEXT,
        // Conversión de Unix Timestamp (Meta) a objeto Date de JS
        timestamp: new Date(Number(messageData.timestamp) * 1000),
        externalId: externalId,
        tenantId: this.MVP_DEV_TENANT_ID,
      });

      // 3. Persistencia mediante el puerto (Desacoplado de la DB real)
      await this.messageRepository.save(message);
      this.logger.log(`Mensaje entrante procesado exitosamente: ${externalId}`);
    } catch (error) {
      this.logger.error('Fallo crítico en el procesamiento del Webhook', error.stack);
    }
  }
}