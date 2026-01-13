import { Inject, Injectable } from '@nestjs/common';
import { Message } from '../../domain/entities/message.entity';
// 👇 Separamos el Símbolo (Valor) del Tipo (Interfaz)
import { MESSAGE_REPOSITORY_PORT } from '../../domain/ports/message.repository.port';
import type { MessageRepositoryPort } from '../../domain/ports/message.repository.port';

@Injectable()
export class GetTenantMessagesUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY_PORT)
    private readonly messageRepository: MessageRepositoryPort,
  ) {}

  async execute(tenantId: string): Promise<Message[]> {
    return this.messageRepository.findByTenant(tenantId);
  }
}