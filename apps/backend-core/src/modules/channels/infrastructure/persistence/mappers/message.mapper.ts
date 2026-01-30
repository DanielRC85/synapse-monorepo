import { Message, MessageType } from '../../../domain/entities/message.entity';
import { MessageOrmEntity } from '../entities/message.orm-entity';

export class MessageMapper {
  static toDomain(ormEntity: MessageOrmEntity): Message {
    return Message.create({
      sender: ormEntity.sender,
      // Como ahora ormEntity.recipient puede ser null, esto funciona perfecto:
      recipient: ormEntity.recipient || undefined, 
      content: ormEntity.content,
      type: ormEntity.type as MessageType,
      timestamp: ormEntity.timestamp,
      externalId: ormEntity.externalId,
      tenantId: ormEntity.tenantId,
      isOutbound: ormEntity.isOutbound,
      hasMedia: ormEntity.hasMedia,
    }, ormEntity.id);
  }

  static toPersistence(domainEntity: Message): MessageOrmEntity {
    const ormEntity = new MessageOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.sender = domainEntity.sender;
    // 👇 Aquí estaba el error rojo. Con el cambio de arriba, YA NO FALLARÁ.
    ormEntity.recipient = domainEntity.recipient || null; 
    ormEntity.content = domainEntity.content;
    ormEntity.type = domainEntity.type;
    ormEntity.timestamp = domainEntity.timestamp;
    ormEntity.externalId = domainEntity.externalId;
    ormEntity.tenantId = domainEntity.tenantId;
    ormEntity.isOutbound = domainEntity.isOutbound;
    ormEntity.hasMedia = domainEntity.hasMedia;
    return ormEntity;
  }
}