import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'; // 👈 Importante
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. ACTIVAR VALIDACIONES (El "Portero" de datos)
  // Esto hace que @IsNotEmpty y @IsUUID funcionen. 
  // Si envías datos mal, te dará un error claro en lugar de romper la base de datos.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina datos que no estén en el DTO (seguridad)
      forbidNonWhitelisted: true, // Tira error si envían basura extra
      transform: true, // Convierte los tipos de datos automáticamente
    }),
  );

  // 2. ACTIVAR CORS (El "Puente" para el Frontend)
  // Sin esto, tu React App (puerto 5173) no podrá hablar con el Backend (puerto 3000)
  app.enableCors({
    origin: true, // O pon 'http://localhost:5173' para ser más estricto
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend corriendo en: ${await app.getUrl()}`);
}
bootstrap();