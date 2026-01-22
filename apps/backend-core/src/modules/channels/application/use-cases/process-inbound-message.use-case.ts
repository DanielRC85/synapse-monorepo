import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message, MessageType } from '../../domain/entities/message.entity';
import { MESSAGE_REPOSITORY_PORT } from '../../domain/ports/message.repository.port';
import type { MessageRepositoryPort } from '../../domain/ports/message.repository.port';

// Definimos una interfaz local para tipar la respuesta de Meta y evitar 'any'
interface MetaWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          id: string;
          from: string;
          timestamp: string;
          type: string;
          text?: { body: string };
          [key: string]: any; // Flexibilidad para otros campos
        }>;
        metadata?: {
          display_phone_number: string;
          phone_number_id: string;
        };
      };
    }>;
  }>;
}

@Injectable()
export class ProcessInboundMessageUseCase {
  private readonly logger = new Logger(ProcessInboundMessageUseCase.name);

  // TODO [MVP]: ID fijo para entorno de desarrollo. 
  // En producción, esto debe resolverse dinámicamente buscando el phone_number_id en la DB.
  private readonly MVP_DEV_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

  constructor(
    @Inject(MESSAGE_REPOSITORY_PORT)
    private readonly messageRepository: MessageRepositoryPort,
  ) {}

  async execute(rawPayload: MetaWebhookPayload): Promise<void> {
    try {
      // 1. Extracción Segura (Optional Chaining)
      const changeValue = rawPayload?.entry?.[0]?.changes?.[0]?.value;

      // Validación: Si no es un mensaje (ej: status update 'read'/'sent'), ignoramos silenciosamente
      if (!changeValue?.messages || changeValue.messages.length === 0) {
        return; 
      }

      const messageData = changeValue.messages[0];
      
      // 2. Mapeo de Datos
      const externalId = messageData.id;
      const sender = messageData.from; 
      const timestamp = messageData.timestamp; 
      
      // Manejo de contenido: Si no es texto, guardamos una nota técnica
      const content = messageData.type === 'text' 
        ? messageData.text?.body 
        : `[UNSUPPORTED CONTENT TYPE: ${messageData.type?.toUpperCase()}]`;

      // 3. Verificación de Idempotencia (Clean Log)
      const existingMessage = await this.messageRepository.findByExternalId(externalId);
      if (existingMessage) {
        this.logger.warn(`Duplicate message detected. ID: ${externalId} | Sender: ${sender}`);
        return;
      }

      // 4. Creación de Entidad de Dominio
      const message = Message.create({
        sender: sender,
        content: content || '',
        type: MessageType.TEXT, 
        timestamp: new Date(Number(timestamp) * 1000), 
        externalId: externalId,
        tenantId: this.MVP_DEV_TENANT_ID, // Usamos la constante documentada
      });

      // 5. Persistencia
      await this.messageRepository.save(message);
      
      this.logger.log(`Message processed & saved. ID: ${externalId} | Tenant: ${this.MVP_DEV_TENANT_ID}`);

    } catch (error) {
      // Capturamos errores de lógica interna para no tumbar el webhook controller
      this.logger.error(`Error executing ProcessInboundMessageUseCase: ${error.message}`, error.stack);
      throw error; // Re-lanzamos para que el controller decida cómo responder (aunque el controller ya tiene try-catch)
    }
  }
}