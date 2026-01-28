import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { MessageType } from '../../../domain/entities/message.entity';

@Entity({ name: 'messages', schema: 'app_core' }) 
@Index(['tenantId', 'externalId'], { unique: true })
export class MessageOrmEntity {
  // 👇 CAMBIO 1: Usamos PrimaryGeneratedColumn para que la DB cree el UUID sola
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sender: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'external_id' }) // Es buena práctica mapear a snake_case en DB
  externalId: string;

  @Column({ name: 'tenant_id', type: 'uuid' }) // Mapeamos a tenant_id
  tenantId: string;

  // 👇 CAMBIO 2: Agregamos las columnas que faltaban (y causaban el error rojo)
  @Column({ name: 'is_outbound', default: false })
  isOutbound: boolean;

  @Column({ name: 'has_media', default: false })
  hasMedia: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}