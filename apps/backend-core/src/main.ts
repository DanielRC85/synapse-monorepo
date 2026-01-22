import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Creamos un logger para ver mensajes claros en la consola negra
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);

  // =================================================================
  // 1. CONFIGURACIÓN DE SEGURIDAD (CORREGIDA PARA WEBHOOKS)
  // =================================================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Limpia los datos
      transform: true,            // Convierte tipos (ej: texto a numero)
      forbidNonWhitelisted: false, // 👈 ¡CLAVE! Dejamos pasar datos extra de Meta sin lanzar error
    }),
  );

  // =================================================================
  // 2. CONFIGURACIÓN DE CORS (PARA QUE TU FRONTEND PUEDA ENTRAR)
  // =================================================================
  app.enableCors({
    origin: true, // Permite que React (localhost:5173) se conecte
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // =================================================================
  // 3. INICIO DEL SERVIDOR
  // =================================================================
  const port = process.env.PORT ?? 3000;
  
  await app.listen(port);
  
  logger.log(`🚀 Servidor Backend corriendo en: http://localhost:${port}`);
  logger.log(`🔌 API lista para recibir peticiones (Webhooks abiertos)`);
}
bootstrap();