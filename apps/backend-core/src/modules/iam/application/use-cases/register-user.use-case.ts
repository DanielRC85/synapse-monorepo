import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { User, UserRole } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';

// Se usa 'import type' para resolver el error TS1272 de tipos en decoradores
import type { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { USER_REPOSITORY_PORT } from '../../domain/ports/user.repository.port';

import type { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { PASSWORD_HASHER_PORT } from '../../domain/ports/password-hasher.port';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  /**
   * Orquesta el registro de un nuevo usuario siguiendo el flujo de TDD.
   * @param dto Datos validados de entrada
   */
  async execute(dto: RegisterUserDto): Promise<void> {
    // 1. Validar existencia (Regla de negocio: Unicidad)
    // Asegúrate de que el puerto UserRepositoryPort tenga el método exists()
    const userExists = await this.userRepository.exists(dto.email);
    if (userExists) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    // 2. Transformar entrada a Objetos de Valor (Domain VO)
    const emailVo = Email.create(dto.email);

    // 3. Hashear contraseña a través del puerto de seguridad
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    // 4. Instanciar Entidad de Dominio (Aggregate Root)
    const user = User.create({
      email: emailVo,
      password: hashedPassword,
      role: UserRole.USER,
      tenantId: dto.tenantId,
      isActive: true,
    });

    // 5. Persistir el nuevo estado a través del puerto
    await this.userRepository.save(user);
  }
}