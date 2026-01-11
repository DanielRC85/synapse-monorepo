import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { UserController } from './infrastructure/http/controllers/user.controller';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { USER_REPOSITORY_PORT } from './domain/ports/user.repository.port';
import { TypeOrmUserRepository } from './infrastructure/persistence/repositories/typeorm-user.repository';
import { PASSWORD_HASHER_PORT } from './domain/ports/password-hasher.port';
import { BcryptAdapter } from './infrastructure/security/bcrypt.adapter';

@Module({
  imports: [
    // Registro de la entidad para el repositorio de TypeORM
    TypeOrmModule.forFeature([UserOrmEntity]),
  ],
  controllers: [UserController],
  providers: [
    RegisterUserUseCase,
    // Vinculación dinámica Puerto -> Adaptador
    {
      provide: USER_REPOSITORY_PORT,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: PASSWORD_HASHER_PORT,
      useClass: BcryptAdapter,
    },
  ],
  exports: [RegisterUserUseCase],
})
export class IamModule {}