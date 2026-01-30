import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { MessageType } from '../../../domain/entities/message.entity';

@Entity({ name: 'messages', schema: 'app_core' })
@Index(['tenantId', 'externalId'], { unique: true })
export class MessageOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sender: string;

  // 👇👇👇 ¡ESTA ES LA LÍNEA MÁGICA! 👇👇👇
  // Tienes que poner "string | null". Si solo dice "string", TypeScript explota.
  @Column({ nullable: true })
  recipient: string | null; 

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'external_id' })
  externalId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'is_outbound', default: false })
  isOutbound: boolean;

  @Column({ name: 'has_media', default: false })
  hasMedia: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}