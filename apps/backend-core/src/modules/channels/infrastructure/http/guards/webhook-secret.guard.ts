import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class WebhookSecretGuard implements CanActivate {
  private readonly logger = new Logger(WebhookSecretGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Obtener header (Express convierte headers a lowercase)
    const secretHeader = request.headers['x-synapse-secret'];
    const envSecret = this.configService.get<string>('WEBHOOK_SECRET');

    if (!envSecret) {
      this.logger.error('WEBHOOK_SECRET no está definido en las variables de entorno.');
      return false;
    }

    if (secretHeader !== envSecret) {
      this.logger.warn(`Intento de acceso no autorizado al Webhook desde IP: ${request.ip}`);
      throw new UnauthorizedException('Invalid Webhook Secret');
    }

    return true;
  }
}