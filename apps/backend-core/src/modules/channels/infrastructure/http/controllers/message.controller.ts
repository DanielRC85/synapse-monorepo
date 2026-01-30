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

// --- SEGURIDAD E IDENTIDAD ---
import { AuthGuard } from '../../../../iam/infrastructure/http/guards/auth.guard';
import { CurrentUser } from '../../../../iam/infrastructure/http/decorators/current-user.decorator';
import type { TokenPayload } from '../../../../iam/domain/ports/token-service.port';

// --- CASOS DE USO (LÓGICA DE NEGOCIO) ---
import { GetTenantMessagesUseCase } from '../../../application/use-cases/get-tenant-messages.use-case';
import { SendMessageUseCase } from '../../../application/use-cases/send-message.use-case';
import { SendMessageDto } from '../../../application/dtos/send-message.dto';

/**
 * Controlador REST para la gestión de mensajería.
 * Expone endpoints para enviar mensajes y recuperar el historial de chat.
 */
@Controller('messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(
    private readonly getMessagesUseCase: GetTenantMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  // =================================================================
  // 1. ENDPOINT DE ENVÍO (OUTBOUND)
  // =================================================================
  /**
   * Recibe una solicitud del Frontend para enviar un mensaje a WhatsApp.
   * Valida el token, inyecta el Tenant ID y delega al caso de uso.
   */
  @Post('send')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Body() dto: SendMessageDto, 
    @CurrentUser() user: TokenPayload
  ): Promise<any> {
    this.logger.log(`🚀 Solicitud de envío iniciada por Tenant: ${user.tenantId}`);

    // Aseguramos que el mensaje se asocie al Tenant del usuario autenticado
    const secureDto = { ...dto, tenantId: user.tenantId };
    
    // Ejecución del caso de uso (Guarda en BD -> Envía a Meta)
    const result = await this.sendMessageUseCase.execute(secureDto);
    
    return { success: true, data: result };
  }

  // =================================================================
  // 2. ENDPOINT DE HISTORIAL (CORREGIDO PARA VISUALIZACIÓN)
  // =================================================================
  /**
   * Recupera todos los mensajes almacenados para un Tenant específico.
   * Realiza una transformación de datos (DTO) para que el Frontend (React)
   * pueda renderizarlos correctamente.
   */
  @Get(':tenantId')
  @UseGuards(AuthGuard)
  async getMessages(@Param('tenantId') tenantId: string) {
    // 1. Capa de Aplicación: Obtener datos crudos de la Base de Datos
    const rawMessages = await this.getMessagesUseCase.execute(tenantId);
    
    // 2. Capa de Presentación: Formateo y Traducción
    const formattedMessages = rawMessages.map(msg => {
      
      // Determinamos si el mensaje fue enviado por nosotros ('ME') o por el sistema
      const isMine = msg.sender === 'ME'; 

      return {
        id: msg.id,
        content: msg.content, 
        
        // 🔥 CORRECCIÓN CRÍTICA AQUÍ:
        // El Frontend filtra por número de teléfono. 
        // Antes devolvíamos 'client' (genérico) y el filtro fallaba.
        // AHORA: Si no es mío, devolvemos el número real (ej: '57318...')
        sender: isMine ? 'me' : msg.sender, 
        
        // Propiedad auxiliar para estilos visuales (Color de burbuja)
        direction: isMine ? 'outbound' : 'inbound',

        timestamp: msg.createdAt,
        type: msg.type || 'text' // Fallback a 'text' si no viene tipo
      };
    });

    // 3. Ordenamiento Cronológico (Más antiguo a más nuevo)
    // Esto asegura que el chat se lea de arriba hacia abajo correctamente
    return formattedMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
}