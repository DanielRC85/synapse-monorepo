import { AggregateRoot } from '../../../../shared/domain/types/aggregate-root.base';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  UNKNOWN = 'unknown',
}

export interface MessageProps {
  sender: string;
  recipient?: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  externalId: string;
  tenantId: string;
  isOutbound?: boolean;
  hasMedia?: boolean;
}

export class Message extends AggregateRoot<MessageProps> {
  // 👇 CAMBIO CRÍTICO: Propiedades PÚBLICAS. 
  // Ya no usamos "getters" ocultos. El dato está a la vista siempre.
  public readonly sender: string;
  public readonly recipient?: string;
  public readonly content: string;
  public readonly type: MessageType;
  public readonly timestamp: Date;
  public readonly externalId: string;
  public readonly tenantId: string;
  public readonly isOutbound: boolean;
  public readonly hasMedia: boolean;

  private constructor(props: MessageProps, id?: string) {
    super(props, id);
    // Asignación directa para garantizar visibilidad
    this.sender = props.sender;
    this.recipient = props.recipient;
    this.content = props.content;
    this.type = props.type;
    this.timestamp = props.timestamp || new Date();
    this.externalId = props.externalId;
    this.tenantId = props.tenantId;
    this.isOutbound = props.isOutbound ?? false;
    this.hasMedia = props.hasMedia ?? false;
  }

  public static create(props: MessageProps, id?: string): Message {
    if (!props.tenantId) throw new Error('Message requires a tenantId');
    if (!props.externalId) throw new Error('Message requires an externalId');

    const message = new Message({
      ...props,
      timestamp: props.timestamp || new Date(),
      isOutbound: props.isOutbound ?? false,
      hasMedia: props.hasMedia ?? [MessageType.IMAGE, MessageType.AUDIO, MessageType.DOCUMENT].includes(props.type),
    }, id);

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

  public isIncoming(): boolean {
    return !this.isOutbound;
  }
}