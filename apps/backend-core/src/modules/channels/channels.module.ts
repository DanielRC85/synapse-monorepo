import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Infraestructura (Entidades y Repositorios)
import { MessageOrmEntity } from './infrastructure/persistence/entities/message.orm-entity';
import { TypeOrmMessageRepository } from './infrastructure/persistence/repositories/typeorm-message.repository';

// Dominio (Puertos)
import { MESSAGE_REPOSITORY_PORT } from './domain/ports/message.repository.port';

// Aplicación (Casos de Uso)
import { ProcessInboundMessageUseCase } from './application/use-cases/process-inbound-message.use-case';

// Infraestructura HTTP (Controladores y Guards)
import { WebhookController } from './infrastructure/http/controllers/webhook.controller';
import { WebhookSecretGuard } from './infrastructure/http/guards/webhook-secret.guard';

@Module({
  imports: [
    ConfigModule, // Necesario para el Guard
    TypeOrmModule.forFeature([MessageOrmEntity]),
  ],
  controllers: [WebhookController],
  providers: [
    ProcessInboundMessageUseCase,
    WebhookSecretGuard,
    // Dependency Injection: Binding Interface (Port) -> Implementation (Adapter)
    {
      provide: MESSAGE_REPOSITORY_PORT,
      useClass: TypeOrmMessageRepository,
    },
  ],
  exports: [],
})
export class ChannelsModule {}