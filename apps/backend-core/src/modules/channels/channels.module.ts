import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MessageOrmEntity } from './infrastructure/persistence/entities/message.orm-entity';
import { TypeOrmMessageRepository } from './infrastructure/persistence/repositories/typeorm-message.repository';
import { MESSAGE_REPOSITORY_PORT } from './domain/ports/message.repository.port';
import { OUTBOUND_MESSAGING_PORT } from './domain/ports/outbound-messaging.port';
import { ProcessInboundMessageUseCase } from './application/use-cases/process-inbound-message.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { MetaWhatsAppAdapter } from './infrastructure/messaging/meta-whatsapp.adapter';
import { WebhookController } from './infrastructure/http/controllers/webhook.controller';

@Module({
  imports: [
    HttpModule, // Habilita peticiones externas (Axios) para el adaptador
    TypeOrmModule.forFeature([MessageOrmEntity]),
  ],
  controllers: [WebhookController],
  providers: [
    ProcessInboundMessageUseCase,
    SendMessageUseCase,
    // Vinculación de Interfaces con Implementaciones Concretas
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