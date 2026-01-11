import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from './modules/iam/iam.module'; // Importamos el nuevo módulo

@Module({
  imports: [
    // 1. Configuración de Variables de Entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../infra/.env', 
    }),

    // 2. Conexión a Base de Datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        // autoLoadEntities: true permite que los módulos carguen sus propias entidades
        autoLoadEntities: true, 
        synchronize: true, // ⚠️ Solo para desarrollo
        logging: true,     // Útil para ver las queries de registro
      }),
    }),

    // 3. Módulos de Dominio (Funcionalidades)
    IamModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}