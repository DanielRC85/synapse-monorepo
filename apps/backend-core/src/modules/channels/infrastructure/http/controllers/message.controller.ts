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

  // =================================================================
  // 1. ENVIAR (ESTO NO SE TOCA, YA FUNCIONA)
  // =================================================================
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

  // =================================================================
  // 2. OBTENER HISTORIAL (CORREGIDO PARA ELIMINAR ERROR DE 'DIRECTION')
  // =================================================================
  @Get(':tenantId')
  @UseGuards(AuthGuard)
  async getMessages(@Param('tenantId') tenantId: string) {
    // 1. Obtenemos los datos crudos de la BD
    const rawMessages = await this.getMessagesUseCase.execute(tenantId);
    
    // 2. TRADUCCIÓN PARA REACT
    const formattedMessages = rawMessages.map(msg => {
      
      // 👇 CORRECCIÓN CLAVE:
      // En lugar de buscar 'direction' (que no existe), miramos el REMITENTE.
      // Si el remitente es 'ME' (o el sistema), entonces es OUTBOUND (mío).
      const isMine = msg.sender === 'ME'; 

      return {
        id: msg.id,
        content: msg.content, 
        // React necesita 'me' o 'client'. Aquí hacemos la traducción.
        sender: isMine ? 'me' : 'client', 
        timestamp: msg.createdAt,
        type: 'text' 
      };
    });

    // Ordenamos por fecha
    return formattedMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
}