import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

// --- INFRAESTRUCTURA ---
import { MessageOrmEntity } from './infrastructure/persistence/entities/message.orm-entity';
import { TypeOrmMessageRepository } from './infrastructure/persistence/repositories/typeorm-message.repository';
import { MetaWhatsAppAdapter } from './infrastructure/messaging/meta-whatsapp.adapter';
import { WebhookController } from './infrastructure/http/controllers/webhook.controller';
import { MessageController } from './infrastructure/http/controllers/message.controller';

// --- DOMINIO (ENTIDADES) ---
import { Message } from './domain/entities/message.entity'; // 👈 1. IMPORTAR ESTO NUEVO

// --- PUERTOS (INTERFACES) ---
import { MESSAGE_REPOSITORY_PORT } from './domain/ports/message.repository.port';
import { OUTBOUND_MESSAGING_PORT } from './domain/ports/outbound-messaging.port';

// --- CASOS DE USO ---
import { ProcessInboundMessageUseCase } from './application/use-cases/process-inbound-message.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { GetTenantMessagesUseCase } from './application/use-cases/get-tenant-messages.use-case';

// --- MÓDULOS EXTERNOS ---
import { IamModule } from '../iam/iam.module';

@Module({
  imports: [
    HttpModule,
    // 👇 2. AGREGAR 'Message' AQUI PARA QUE EL CONTROLLER PUEDA GUARDAR DIRECTO
    TypeOrmModule.forFeature([
      MessageOrmEntity, 
      Message 
    ]),
    IamModule, 
  ],
  controllers: [
    WebhookController, 
    MessageController
  ],
  providers: [
    // Casos de Uso
    ProcessInboundMessageUseCase,
    SendMessageUseCase,
    GetTenantMessagesUseCase,

    // Inyecciones de Dependencias
    {
      provide: MESSAGE_REPOSITORY_PORT,
      useClass: TypeOrmMessageRepository,
    },
    {
      provide: OUTBOUND_MESSAGING_PORT,
      useClass: MetaWhatsAppAdapter,
    },
  ],
  exports: [
    MESSAGE_REPOSITORY_PORT, 
    OUTBOUND_MESSAGING_PORT
  ],
})
export class ChannelsModule {}