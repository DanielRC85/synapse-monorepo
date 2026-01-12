import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { MessageType } from '../../domain/entities/message.entity';

/**
 * Data Transfer Object para recibir webhooks de mensajería (WhatsApp/n8n).
 * Garantiza que los datos entrantes cumplan con el contrato antes de tocar el dominio.
 */
export class WhatsAppWebhookDto {
  @IsString({ message: 'El sender debe ser una cadena de texto (teléfono)' })
  @IsNotEmpty()
  readonly sender: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @IsEnum(MessageType, { message: 'El tipo de mensaje no es válido (text, image, document, audio)' })
  readonly type: MessageType;

  @IsNumber({}, { message: 'El timestamp debe ser un número Unix' })
  readonly timestamp: number;

  @IsString()
  @IsNotEmpty()
  readonly externalId: string;

  @IsUUID('4', { message: 'El tenantId debe ser un UUID válido' })
  @IsNotEmpty()
  readonly tenantId: string;
}