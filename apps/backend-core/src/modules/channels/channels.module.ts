import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// --- Módulos Externos ---
import { IamModule } from '../iam/iam.module'; // 👈 IMPORTANTE: Necesario para proteger el endpoint GET

// --- Infraestructura (Persistencia) ---
import { MessageOrmEntity } from './infrastructure/persistence/entities/message.orm-entity';
import { TypeOrmMessageRepository } from './infrastructure/persistence/repositories/typeorm-message.repository';

// --- Dominio (Puertos) ---
import { MESSAGE_REPOSITORY_PORT } from './domain/ports/message.repository.port';

// --- Aplicación (Casos de Uso) ---
import { ProcessInboundMessageUseCase } from './application/use-cases/process-inbound-message.use-case';
import { GetTenantMessagesUseCase } from './application/use-cases/get-tenant-messages.use-case'; // 👈 NUEVO

// --- Infraestructura HTTP (Controladores y Guards) ---
import { WebhookController } from './infrastructure/http/controllers/webhook.controller';
import { MessageController } from './infrastructure/http/controllers/message.controller'; // 👈 NUEVO
import { WebhookSecretGuard } from './infrastructure/http/guards/webhook-secret.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([MessageOrmEntity]),
    IamModule, // 👈 Registrado para que funcione el AuthGuard en MessageController
  ],
  controllers: [
    WebhookController, // Escribe mensajes (Webhook WhatsApp)
    MessageController, // Lee mensajes (API para Frontend) 👈 NUEVO
  ],
  providers: [
    ProcessInboundMessageUseCase,
    GetTenantMessagesUseCase, // 👈 NUEVO
    WebhookSecretGuard,
    // Inyección de Dependencias: Puerto -> Adaptador
    {
      provide: MESSAGE_REPOSITORY_PORT,
      useClass: TypeOrmMessageRepository,
    },
  ],
  exports: [],
})
export class ChannelsModule {}