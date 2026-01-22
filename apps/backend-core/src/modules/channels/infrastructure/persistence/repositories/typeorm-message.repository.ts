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
   * 👇 MÉTODO MODIFICADO CON LOGS PARA VER LA VERDAD
   */
  async save(message: Message): Promise<void> {
    const ormEntity = this.toPersistence(message);

    // 🕵️‍♂️ EL CHISMOSO: Esto imprimirá en tu terminal negra qué está pasando
    console.log("\n==============================================");
    console.log("🚨 [DEBUG] INTENTANDO GUARDAR EN BASE DE DATOS");
    console.log("📩 Contenido:", ormEntity.content);
    console.log("🔑 Tenant ID (Lo importante):", ormEntity.tenantId); 
    console.log("==============================================\n");

    await this.repository.save(ormEntity);
    
    console.log("✅ [DEBUG] ¡TypeORM dice que guardó sin errores!");
  }

  /**
   * Busca por ID externo para validar idempotencia.
   */
  async findByExternalId(externalId: string): Promise<Message | null> {
    const ormEntity = await this.repository.findOne({ where: { externalId } });
    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }

  /**
   * Busca mensajes de un Tenant ordenados cronológicamente.
   */
  async findByTenant(tenantId: string): Promise<Message[]> {
    const ormEntities = await this.repository.find({
      where: { tenantId },
      order: { timestamp: 'ASC' }, 
    });

    return ormEntities.map((entity) => this.toDomain(entity));
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