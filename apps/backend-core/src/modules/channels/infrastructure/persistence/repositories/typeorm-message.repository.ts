import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../../domain/entities/message.entity';
import { MessageRepositoryPort } from '../../../domain/ports/message.repository.port';
import { MessageOrmEntity } from '../entities/message.orm-entity';

@Injectable()
export class TypeOrmMessageRepository implements MessageRepositoryPort {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly repository: Repository<MessageOrmEntity>,
  ) {}

  /**
   * Persiste el mensaje en base de datos.
   */
  async save(message: Message): Promise<void> {
    const ormEntity = this.toPersistence(message);
    await this.repository.save(ormEntity);
  }

  /**
   * Busca por ID externo para validar idempotencia.
   */
  async findByExternalId(externalId: string): Promise<Message | null> {
    const ormEntity = await this.repository.findOne({ where: { externalId } });
    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }

  // --- PRIVATE MAPPERS (Data Mapper Pattern) ---

  private toPersistence(domainEntity: Message): MessageOrmEntity {
    const ormEntity = new MessageOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.sender = domainEntity.sender;
    ormEntity.content = domainEntity.content;
    ormEntity.type = domainEntity.type;
    ormEntity.timestamp = domainEntity.timestamp;
    ormEntity.externalId = domainEntity.externalId;
    ormEntity.tenantId = domainEntity.tenantId;
    // createdAt es gestionado por la DB por defecto, o podría mapearse si existiera en el dominio base
    return ormEntity;
  }

  private toDomain(ormEntity: MessageOrmEntity): Message {
    return Message.create(
      {
        sender: ormEntity.sender,
        content: ormEntity.content,
        type: ormEntity.type,
        timestamp: ormEntity.timestamp,
        externalId: ormEntity.externalId,
        tenantId: ormEntity.tenantId,
      },
      ormEntity.id,
    );
  }
}