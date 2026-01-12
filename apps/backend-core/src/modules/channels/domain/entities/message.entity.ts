import { AggregateRoot } from '../../../../shared/domain/types/aggregate-root.base';

// Enums estrictos para evitar "magic strings"
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  UNKNOWN = 'unknown',
}

export interface MessageProps {
  sender: string;     // E.164
  content: string;
  type: MessageType;
  timestamp: Date;
  externalId: string; // Vital para idempotencia
  tenantId: string;   // Vital para seguridad de datos
}

export class Message extends AggregateRoot<MessageProps> {
  
  // Constructor privado: Solo el Factory Method estático puede crear instancias.
  private constructor(props: MessageProps, id?: string) {
    super(props, id);
  }

  /**
   * 🏭 FACTORY METHOD
   * Crea una instancia válida y dispara el evento de "Mensaje Recibido".
   */
  public static create(props: MessageProps, id?: string): Message {
    // 1. VALIDACIONES DE DOMINIO (Fail Fast)
    // No permitimos que exista un mensaje sin dueño (tenant) o sin ID externo.
    if (!props.tenantId) {
      throw new Error('Message requires a tenantId');
    }
    if (!props.externalId) {
      throw new Error('Message requires an externalId for idempotency');
    }

    // 2. CREACIÓN
    const message = new Message({
      ...props,
      // Si llega sin fecha, asumimos "ahora" (defensive programming)
      timestamp: props.timestamp || new Date(), 
    }, id);

    // 3. EVENTO DE DOMINIO (La magia del Event-Driven)
    // Solo disparamos el evento si es un mensaje NUEVO (sin ID previo)
    if (!id) {
      message.addDomainEvent({
        eventName: 'channels.message_received',
        payload: {
          messageId: message.id,
          externalId: message.externalId,
          tenantId: message.tenantId
        },
        occurredOn: new Date()
      });
    }

    return message;
  }

  // --- 🧠 MÉTODOS DE NEGOCIO (Comportamiento, no solo datos) ---

  /**
   * Determina si el mensaje contiene archivos adjuntos.
   * Útil para decidir si descargar el archivo de WhatsApp o no.
   */
  public hasMedia(): boolean {
    return [MessageType.IMAGE, MessageType.AUDIO, MessageType.DOCUMENT].includes(this.props.type);
  }

  // --- 🔒 GETTERS (Inmutabilidad) ---
  
  get sender(): string { return this.props.sender; }
  get content(): string { return this.props.content; }
  get type(): MessageType { return this.props.type; }
  get timestamp(): Date { return this.props.timestamp; }
  get externalId(): string { return this.props.externalId; }
  get tenantId(): string { return this.props.tenantId; }
}