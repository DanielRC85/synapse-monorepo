import { Entity, Column, PrimaryColumn, Index } from 'typeorm';
import { MessageType } from '../../../domain/entities/message.entity';

@Entity('messages')
@Index(['tenantId', 'externalId'], { unique: true }) // Barrera final de unicidad
export class MessageOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  sender: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: MessageType }) // Mapeo directo del Enum de Dominio
  type: MessageType;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column()
  externalId: string;

  @Column('uuid')
  tenantId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}