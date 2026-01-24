import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Instancia de Logger para trazas limpias en la terminal
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);

  // =================================================================
  // 1. CONFIGURACIÓN DE VALIDACIÓN (CRÍTICO PARA META WEBHOOKS)
  // =================================================================
  app.useGlobalPipes(
    new ValidationPipe({
      // ✅ Limpieza: Elimina propiedades que no estén en los DTOs
      whitelist: false,
      
      // ✅ Transformación: Convierte payloads JSON a instancias de clases DTO automáticamente
      transform: true,
      
      // ⚠️ IMPORTANTE: Debe estar en FALSE. 
      // Meta envía campos extra no documentados en sus webhooks. 
      // Si esto está en 'true', NestJS rechazará los mensajes de WhatsApp con error 400.
      forbidNonWhitelisted: false, 
    }),
  );

  // =================================================================
  // 2. CONFIGURACIÓN DE CORS (PUENTE PARA EL FRONTEND REACT)
  // =================================================================
  app.enableCors({
    // Permite cualquier origen en desarrollo (localhost:5173, etc.)
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // =================================================================
  // 3. ARRANQUE DEL SERVIDOR
  // =================================================================
  const port = process.env.PORT ?? 3000;
  
  await app.listen(port);
  
  logger.log(`🚀 Servidor Backend corriendo en: http://localhost:${port}`);
  logger.log(`🔓 CORS Habilitado: React ya puede enviar mensajes`);
  logger.log(`📡 Webhooks Listos: Esperando eventos de Meta...`);
}
bootstrap();