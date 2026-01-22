import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  UseGuards, 
  HttpCode, 
  HttpStatus,
  Logger
} from '@nestjs/common';

// --- SEGURIDAD ---
import { AuthGuard } from '../../../../iam/infrastructure/http/guards/auth.guard';
import { CurrentUser } from '../../../../iam/infrastructure/http/decorators/current-user.decorator';
import type { TokenPayload } from '../../../../iam/domain/ports/token-service.port';

// --- CASOS DE USO (Lógica de Negocio) ---
import { GetTenantMessagesUseCase } from '../../../application/use-cases/get-tenant-messages.use-case';
import { SendMessageUseCase } from '../../../application/use-cases/send-message.use-case';
import { ProcessInboundMessageUseCase } from '../../../application/use-cases/process-inbound-message.use-case';

// --- DTOs ---
import { SendMessageDto } from '../../../application/dtos/send-message.dto';

@Controller('channels/messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(
    private readonly getMessagesUseCase: GetTenantMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly processInboundUseCase: ProcessInboundMessageUseCase,
  ) {}

  // =================================================================
  // 🟢 ZONA PÚBLICA (WEBHOOK DE META / WHATSAPP)
  // =================================================================

  // 1. VERIFICACIÓN (Meta pregunta: "¿Existes?")
  @Get() 
  verifyWebhook(@Query() query: any) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    // ⚠️ Asegúrate de que este token coincida con el que pongas en developers.facebook.com
    if (mode === 'subscribe' && token === 'synapse_ultra_secret_key_2026') {
      this.logger.log('✅ Webhook verificado correctamente por Meta');
      return challenge; // Retornamos el reto tal cual
    }
    
    this.logger.warn('⚠️ Intento de verificación fallido (Token incorrecto)');
    // Si falla, lanzamos error para que Meta sepa que algo anda mal
    return 'Verificación Fallida'; 
  }

  // 2. RECEPCIÓN (Meta dice: "¡Tienes un mensaje nuevo!")
  @Post()
  @HttpCode(HttpStatus.OK) // 👈 IMPORTANTE: Forzamos 200 OK para que Meta no reintente
  async handleIncomingMessage(@Body() body: any) {
    // Solo logueamos si realmente es un mensaje (para no ensuciar la consola con estados)
    if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
      this.logger.log('📩 Procesando mensaje entrante de WhatsApp...');
    }
    
    // 👇 ¡LA MAGIA!: Guardamos en Base de Datos
    await this.processInboundUseCase.execute(body);

    return { status: 'received' };
  }

  // =================================================================
  // 🔒 ZONA PRIVADA (TU FRONTEND / REACT)
  // =================================================================

  // 3. HISTORIAL (React dice: "Dame los chats")
  // Coincide con: chatService.getMessages('/history')
  @Get('history')
  @UseGuards(AuthGuard)
  async getMessages(@CurrentUser() user: TokenPayload) {
    // Usamos el ID del token (seguro) en lugar del query param
    const messages = await this.getMessagesUseCase.execute(user.tenantId);
    
    // Mapeamos para que el Frontend entienda fácil quién envió qué
    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,     // El número de teléfono
      type: msg.type,
      timestamp: msg.timestamp,
      // Si el sender soy YO ('ME'), es salida. Si no, es entrada.
      direction: msg.sender === 'ME' ? 'outbound' : 'inbound', 
    }));
  }

  // 4. ENVIAR (React dice: "Manda esto")
  // Coincide con: chatService.sendMessage('/send')
  @Post('send')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Body() dto: SendMessageDto, 
    @CurrentUser() user: TokenPayload
  ): Promise<void> {
    
    // 🛡️ SEGURIDAD: Sobrescribimos el tenantId con el del usuario logueado.
    // Así nadie puede enviar mensajes a nombre de otro tenant.
    const secureDto = { 
      ...dto, 
      tenantId: user.tenantId 
    };
    
    await this.sendMessageUseCase.execute(secureDto);
  }
}