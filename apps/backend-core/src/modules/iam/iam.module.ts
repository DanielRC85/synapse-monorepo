import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entidades e Infraestructura
import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { UserController } from './infrastructure/http/controllers/user.controller';
import { TypeOrmUserRepository } from './infrastructure/persistence/repositories/typeorm-user.repository';
import { BcryptAdapter } from './infrastructure/security/bcrypt.adapter';
import { JwtAdapter } from './infrastructure/security/jwt.adapter';

// Puertos (Interfaces)
import { USER_REPOSITORY_PORT } from './domain/ports/user.repository.port';
import { PASSWORD_HASHER_PORT } from './domain/ports/password-hasher.port';
import { TOKEN_SERVICE_PORT } from './domain/ports/token-service.port';

// Casos de Uso
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';

@Module({
  imports: [
    // Conexión con la DB
    TypeOrmModule.forFeature([UserOrmEntity]),
    
    // Configuración de JWT usando variables de entorno
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'super-secret'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [
    // Casos de Uso
    RegisterUserUseCase,
    LoginUserUseCase,
    
    // Vinculación de Puertos con Adaptadores (Inyección de Dependencias)
    {
      provide: USER_REPOSITORY_PORT,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: PASSWORD_HASHER_PORT,
      useClass: BcryptAdapter,
    },
    {
      provide: TOKEN_SERVICE_PORT,
      useClass: JwtAdapter,
    },
  ],
  // Exportamos los puertos y casos de uso necesarios para otros módulos
  exports: [
    RegisterUserUseCase, 
    LoginUserUseCase,
    TOKEN_SERVICE_PORT // 👈 ¡AGREGADO! Esto permite que ChannelsModule use AuthGuard
  ],
})
export class IamModule {}