import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios'; // 👈 IMPORTANTE: Para conectar con Meta

// --- Módulos Externos ---
import { IamModule } from '../iam/iam.module'; 

// --- Infraestructura (Persistencia) ---
import { MessageOrmEntity } from './infrastructure/persistence/entities/message.orm-entity';
import { TypeOrmMessageRepository } from './infrastructure/persistence/repositories/typeorm-message.repository';

// --- Dominio (Puertos) ---
import { MESSAGE_REPOSITORY_PORT } from './domain/ports/message.repository.port';
import { OUTBOUND_MESSAGING_PORT } from './domain/ports/outbound-messaging.port'; // 👈 NUEVO

// --- Aplicación (Casos de Uso) ---
import { ProcessInboundMessageUseCase } from './application/use-cases/process-inbound-message.use-case';
import { GetTenantMessagesUseCase } from './application/use-cases/get-tenant-messages.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case'; // 👈 NUEVO

// --- Infraestructura HTTP & Adapters ---
import { WebhookController } from './infrastructure/http/controllers/webhook.controller';
import { MessageController } from './infrastructure/http/controllers/message.controller';
import { WebhookSecretGuard } from './infrastructure/http/guards/webhook-secret.guard';
import { MetaWhatsAppAdapter } from './infrastructure/messaging/meta-whatsapp.adapter'; // 👈 NUEVO

@Module({
  imports: [
    ConfigModule,
    HttpModule, // 👈 Registrado para poder usar HttpService en el Adapter
    TypeOrmModule.forFeature([MessageOrmEntity]),
    IamModule, 
  ],
  controllers: [
    WebhookController, // Inbound (Webhook de Meta)
    MessageController, // API REST para el Frontend
  ],
  providers: [
    ProcessInboundMessageUseCase,
    GetTenantMessagesUseCase,
    SendMessageUseCase, // 👈 Lógica de envío
    WebhookSecretGuard,
    // Persistencia
    {
      provide: MESSAGE_REPOSITORY_PORT,
      useClass: TypeOrmMessageRepository,
    },
    // Comunicación con Meta (Outbound)
    {
      provide: OUTBOUND_MESSAGING_PORT,
      useClass: MetaWhatsAppAdapter,
    },
  ],
  exports: [],
})
export class ChannelsModule {}