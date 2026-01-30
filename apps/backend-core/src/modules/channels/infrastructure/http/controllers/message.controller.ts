import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param,
  UseGuards, 
  HttpCode, 
  HttpStatus,
  Logger
} from '@nestjs/common';

import { AuthGuard } from '../../../../iam/infrastructure/http/guards/auth.guard';
import { CurrentUser } from '../../../../iam/infrastructure/http/decorators/current-user.decorator';
import type { TokenPayload } from '../../../../iam/domain/ports/token-service.port';

import { GetTenantMessagesUseCase } from '../../../application/use-cases/get-tenant-messages.use-case';
import { SendMessageUseCase } from '../../../application/use-cases/send-message.use-case';
import { SendMessageDto } from '../../../application/dtos/send-message.dto';

@Controller('messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(
    private readonly getMessagesUseCase: GetTenantMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  // 1. ENVIAR MENSAJE
  @Post('send')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Body() dto: SendMessageDto, 
    @CurrentUser() user: TokenPayload
  ): Promise<any> {
    this.logger.log(`🚀 Solicitud de envío para Tenant: ${user.tenantId}`);
    const secureDto = { ...dto, tenantId: user.tenantId };
    const result = await this.sendMessageUseCase.execute(secureDto);
    return { success: true, data: result };
  }

  // 2. OBTENER HISTORIAL (CORREGIDO PARA TYPE SCRIPT)
  @Get(':tenantId')
  @UseGuards(AuthGuard)
  async getMessages(@Param('tenantId') tenantId: string) {
    const rawMessages = await this.getMessagesUseCase.execute(tenantId);
    
    const formattedMessages = rawMessages.map(msg => {
      // Normalizamos quién envió el mensaje
      const isMine = msg.sender === 'ME' || msg.sender === 'SISTEMA'; 

      // 🛠️ HOTFIX TYPE SCRIPT:
      // Usamos 'as any' para que TypeScript no se queje de la propiedad recipient
      // (Sabemos que existe en la BD aunque la entidad antigua no la tenga declarada)
      const messageData = msg as any;

      // 🧠 LÓGICA MAESTRA DE UNIFICACIÓN: 
      const conversationId = isMine 
          ? (messageData.recipient || 'SISTEMA_ORPHAN') 
          : msg.sender;

      return {
        id: msg.id,
        content: msg.content, 
        
        // Enviamos el ID real de la conversación
        conversationId: conversationId,

        // Para visualización
        sender: isMine ? 'me' : conversationId, 
        
        direction: isMine ? 'outbound' : 'inbound',
        timestamp: msg.createdAt,
        type: msg.type || 'text'
      };
    });

    return formattedMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
}