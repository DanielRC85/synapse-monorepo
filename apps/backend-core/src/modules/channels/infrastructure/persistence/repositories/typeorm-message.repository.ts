import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 👇 CORRECCIÓN DE RUTAS: Solo subimos 3 niveles para llegar a 'domain'
import { Message } from '../../../domain/entities/message.entity';
// 👇 CORRECCIÓN DE NOMBRE: Usamos el nombre exacto que tienes en tu puerto
import { MessageRepositoryPort } from '../../../domain/ports/message.repository.port'; 
import { MessageOrmEntity } from '../entities/message.orm-entity';
import { MessageMapper } from '../mappers/message.mapper';

@Injectable()
export class TypeOrmMessageRepository implements MessageRepositoryPort {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly repository: Repository<MessageOrmEntity>,
  ) {}

  /**
   * Guarda un mensaje en la base de datos usando el Mapper para no perder datos
   */
  async create(message: Message): Promise<Message> {
    // 1. Convertimos de Dominio -> Persistencia (Aquí se guarda el recipient)
    const persistenceModel = MessageMapper.toPersistence(message);
    
    // 2. Guardamos en Postgres
    const newEntity = await this.repository.save(persistenceModel);
    
    // 3. Devolvemos de Persistencia -> Dominio
    return MessageMapper.toDomain(newEntity);
  }

  /**
   * Alias de 'create' para cumplir con la interfaz si pide 'save'
   */
  async save(message: Message): Promise<void> {
    await this.create(message);
  }

  /**
   * Busca por ID externo (útil para evitar duplicados de Meta)
   */
  async findByExternalId(externalId: string): Promise<Message | null> {
    const ormEntity = await this.repository.findOne({ where: { externalId } });
    if (!ormEntity) return null;
    return MessageMapper.toDomain(ormEntity);
  }

  /**
   * Busca todos los mensajes de un Tenant ordenados por fecha
   */
  async findByTenantId(tenantId: string): Promise<Message[]> {
    const ormEntities = await this.repository.find({
      where: { tenantId },
      order: { timestamp: 'ASC' },
    });
    return ormEntities.map((entity) => MessageMapper.toDomain(entity));
  }
  
  /**
   * Alias por si tu interfaz usa 'findByTenant' en lugar de 'findByTenantId'
   */
  async findByTenant(tenantId: string): Promise<Message[]> {
    return this.findByTenantId(tenantId);
  }
}