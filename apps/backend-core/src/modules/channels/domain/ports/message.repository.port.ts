import { Message } from '../entities/message.entity';

export interface MessageRepositoryPort {
  /**
   * Persiste un mensaje en el almacenamiento.
   */
  save(message: Message): Promise<void>;

  /**
   * Busca un mensaje por su ID externo (WhatsApp ID).
   * Vital para evitar procesar duplicados (Idempotencia).
   */
  findByExternalId(externalId: string): Promise<Message | null>;
}

// Token para Inyección de Dependencias
export const MESSAGE_REPOSITORY_PORT = Symbol('MessageRepositoryPort');