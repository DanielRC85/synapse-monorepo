import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../../iam/infrastructure/http/guards/auth.guard';
import { CurrentUser } from '../../../../iam/infrastructure/http/decorators/current-user.decorator';

// 👇 AQUÍ ESTÁ LA CORRECCIÓN: Agregamos "type" al import
import type { TokenPayload } from '../../../../iam/domain/ports/token-service.port';

import { GetTenantMessagesUseCase } from '../../../application/use-cases/get-tenant-messages.use-case';

@Controller('channels/messages')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private readonly getMessagesUseCase: GetTenantMessagesUseCase) {}

  @Get()
  async getMessages(@CurrentUser() user: TokenPayload) {
    const messages = await this.getMessagesUseCase.execute(user.tenantId);
    
    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      type: msg.type,
      timestamp: msg.timestamp,
      direction: 'inbound', 
    }));
  }
}