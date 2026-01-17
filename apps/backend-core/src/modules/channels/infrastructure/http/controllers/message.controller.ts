import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';

import { AuthGuard } from '../../../../iam/infrastructure/http/guards/auth.guard';
import { CurrentUser } from '../../../../iam/infrastructure/http/decorators/current-user.decorator';

// ⚠️ CORRECCIÓN IMPORTS: Usamos 'import type' para interfaces que no son clases reales
import type { TokenPayload } from '../../../../iam/domain/ports/token-service.port';

import { GetTenantMessagesUseCase } from '../../../application/use-cases/get-tenant-messages.use-case';
import { SendMessageUseCase } from '../../../application/use-cases/send-message.use-case';
import { SendMessageDto } from '../../../application/dtos/send-message.dto';

@Controller('channels/messages')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(
    private readonly getMessagesUseCase: GetTenantMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  @Get()
  async getMessages(@CurrentUser() user: TokenPayload) {
    const messages = await this.getMessagesUseCase.execute(user.tenantId);
    
    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      type: msg.type,
      timestamp: msg.timestamp,
      // Si tu entidad aún no tiene 'direction', calculamos 'inbound' por defecto
      // o verificamos si el sender es 'ME' para decir 'outbound'
      direction: msg.sender === 'ME' ? 'outbound' : 'inbound', 
    }));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Body() dto: SendMessageDto, 
    @CurrentUser() user: TokenPayload
  ): Promise<void> {
    // Forzamos el tenantId del token por seguridad (para que no envíen a nombre de otro)
    const secureDto = { 
      ...dto, 
      tenantId: user.tenantId 
    };
    
    await this.sendMessageUseCase.execute(secureDto);
  }
}