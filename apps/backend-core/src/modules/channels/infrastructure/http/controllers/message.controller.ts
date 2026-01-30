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

  // 2. OBTENER HISTORIAL (LÓGICA UNIFICADA)
  @Get(':tenantId')
  @UseGuards(AuthGuard)
  async getMessages(@Param('tenantId') tenantId: string) {
    const rawMessages = await this.getMessagesUseCase.execute(tenantId);
    
    const formattedMessages = rawMessages.map(msg => {
      // Normalizamos quién envió el mensaje
      const isMine = msg.sender === 'ME' || msg.sender === 'SISTEMA'; 

      // 🛠️ SEGURIDAD DE TIPOS: Usamos 'as any' temporalmente para asegurar 
      // que lea la propiedad 'recipient' de la base de datos sin errores de compilación.
      const messageData = msg as any;

      // 🧠 CÁLCULO DE CONVERSACIÓN:
      const conversationId = isMine 
          ? (messageData.recipient || 'SISTEMA_ORPHAN') 
          : msg.sender;

      return {
        id: msg.id,
        content: msg.content, 
        
        // Enviamos el ID calculado para agrupar
        conversationId: conversationId,

        // Para visualización: 'me' o el número real
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