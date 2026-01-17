import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from './modules/iam/iam.module';
import { ChannelsModule } from './modules/channels/channels.module';

@Module({
  imports: [
    // 1. Configuración de Variables de Entorno (CORREGIDO)
    ConfigModule.forRoot({
      isGlobal: true,
      // Busca en la carpeta actual (.env) Y en la carpeta de infra por si acaso
      // El orden importa: el primero que encuentre gana.
      envFilePath: ['.env', 'apps/backend-core/.env', '../../infra/.env'], 
    }),

    // 2. Conexión a Base de Datos (NOMBRES CORREGIDOS)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        // ⚠️ CAMBIO CRÍTICO: Usamos los nombres de tu nuevo .env
        username: configService.get<string>('DB_USERNAME', 'synapse_admin'), 
        password: configService.get<string>('DB_PASSWORD', 'admin_password_123'), 
        database: configService.get<string>('DB_NAME', 'synapse_core'),
        
        autoLoadEntities: true, 
        synchronize: true, // Solo desarrollo
        logging: false,    // Poner en false para limpiar la consola un poco
      }),
    }),

    // 3. Módulos de Dominio
    IamModule, 
    ChannelsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}