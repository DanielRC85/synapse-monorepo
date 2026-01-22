import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// --- Módulos Externos ---
import { IamModule } from '../iam/iam.module'; 

// --- Infraestructura (Persistencia) ---
import { MessageOrmEntity } from './infrastructure/persistence/entities/message.orm-entity';
import { TypeOrmMessageRepository } from './infrastructure/persistence/repositories/typeorm-message.repository';

// --- Dominio (Puertos) ---
import { MESSAGE_REPOSITORY_PORT } from './domain/ports/message.repository.port';
import { OUTBOUND_MESSAGING_PORT } from './domain/ports/outbound-messaging.port';

// --- Aplicación (Casos de Uso) ---
import { ProcessInboundMessageUseCase } from './application/use-cases/process-inbound-message.use-case';
import { GetTenantMessagesUseCase } from './application/use-cases/get-tenant-messages.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';

// --- Infraestructura HTTP & Adapters ---
import { WebhookController } from './infrastructure/http/controllers/webhook.controller';
import { MessageController } from './infrastructure/http/controllers/message.controller';
import { MetaWhatsAppAdapter } from './infrastructure/messaging/meta-whatsapp.adapter';

@Module({
  imports: [
    ConfigModule,
    HttpModule, // Necesario para que el MetaWhatsAppAdapter use HttpService
    TypeOrmModule.forFeature([MessageOrmEntity]),
    IamModule, 
  ],
  controllers: [
    WebhookController, // Maneja el tráfico entrante (Inbound)
    MessageController, // API REST para el Dashboard Web
  ],
  providers: [
    // --- Casos de Uso ---
    ProcessInboundMessageUseCase,
    GetTenantMessagesUseCase,
    SendMessageUseCase,

    // --- Adaptadores de Persistencia ---
    {
      provide: MESSAGE_REPOSITORY_PORT,
      useClass: TypeOrmMessageRepository,
    },

    // --- Adaptadores de Mensajería (Outbound) ---
    {
      provide: OUTBOUND_MESSAGING_PORT,
      useClass: MetaWhatsAppAdapter,
    },
  ],
  exports: [
    // Exportamos los puertos por si otros módulos necesitan enviar o leer mensajes
    MESSAGE_REPOSITORY_PORT,
    OUTBOUND_MESSAGING_PORT,
  ],
})
export class ChannelsModule {}