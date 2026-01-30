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
  sender: string;     // E.164 (Quién envía)
  recipient?: string; // 👈 NUEVO: Para saber a quién se le envió (vital para tu fix)
  content: string;
  type: MessageType;
  timestamp: Date;
  externalId: string; // Vital para idempotencia
  tenantId: string;   // Vital para seguridad de datos
  isOutbound?: boolean; // 👈 NUEVO: true = Enviado por nosotros, false = Recibido
  hasMedia?: boolean;   // 👈 NUEVO: Para persistencia rápida
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
    if (!props.tenantId) {
      throw new Error('Message requires a tenantId');
    }
    if (!props.externalId) {
      throw new Error('Message requires an externalId for idempotency');
    }

    // 2. CREACIÓN
    const message = new Message({
      ...props,
      // Valores por defecto defensivos
      timestamp: props.timestamp || new Date(),
      isOutbound: props.isOutbound ?? false, // Si no se especifica, asumimos entrante
      hasMedia: props.hasMedia ?? [MessageType.IMAGE, MessageType.AUDIO, MessageType.DOCUMENT].includes(props.type),
    }, id);

    // 3. EVENTO DE DOMINIO (Solo si es nuevo y ENTRANTE)
    // No queremos disparar "message_received" si es uno que nosotros enviamos
    if (!id && !message.isOutbound) {
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

  // --- 🧠 MÉTODOS DE NEGOCIO ---

  public isIncoming(): boolean {
    return !this.props.isOutbound;
  }

  // --- 🔒 GETTERS (Inmutabilidad) ---
  
  get sender(): string { return this.props.sender; }
  get recipient(): string | undefined { return this.props.recipient; } // 👈 Getter nuevo
  get content(): string { return this.props.content; }
  get type(): MessageType { return this.props.type; }
  get timestamp(): Date { return this.props.timestamp; }
  get externalId(): string { return this.props.externalId; }
  get tenantId(): string { return this.props.tenantId; }
  get isOutbound(): boolean { return this.props.isOutbound || false; } // 👈 Getter nuevo
  get hasMedia(): boolean { return this.props.hasMedia || false; }     // 👈 Getter nuevo
}