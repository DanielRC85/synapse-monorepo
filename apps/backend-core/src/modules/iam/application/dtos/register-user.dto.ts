import { IsEmail, IsNotEmpty, IsString, MinLength, IsUUID, IsOptional } from 'class-validator';

/**
 * Data Transfer Object para el registro de usuarios.
 * Aplica validación declarativa mediante class-validator.
 */
export class RegisterUserDto {
  @IsEmail({}, { message: 'El formato del correo electrónico es inválido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  readonly email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  readonly password: string;

  @IsUUID('4', { message: 'El tenantId debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El tenantId es requerido' })
  readonly tenantId: string;
}