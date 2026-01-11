import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
// Importamos solo los tipos para los decoradores de NestJS
import type { LoginUserDto, AuthResponseDto } from '../dtos/auth.dto';
import { USER_REPOSITORY_PORT, type UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { PASSWORD_HASHER_PORT, type PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { TOKEN_SERVICE_PORT, type TokenServicePort } from '../../domain/ports/token-service.port';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE_PORT)
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
    // 1. Buscar usuario
    const user = await this.userRepository.findByEmail(dto.email);
    
    // Verificamos si existe y si está activo
    if (!user || !(user as any).isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Validar contraseña
    // Usamos (user as any).password para saltar la restricción de visibilidad de la entidad
    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      (user as any).password, 
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar JWT
    const accessToken = await this.tokenService.generateToken({
      sub: user.id,
      email: user.email.value,
      role: user.role,
      tenantId: user.tenantId,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email.value,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}