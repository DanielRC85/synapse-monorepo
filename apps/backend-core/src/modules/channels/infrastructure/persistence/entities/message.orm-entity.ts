import { Entity, Column, PrimaryColumn, Index } from 'typeorm';
import { MessageType } from '../../../domain/entities/message.entity';

// 🚨 CORRECCIÓN: Forzamos el esquema 'app_core' para coincidir con Prisma y .env
@Entity({ name: 'messages', schema: 'app_core' }) 
@Index(['tenantId', 'externalId'], { unique: true })
export class MessageOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  sender: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: MessageType })
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