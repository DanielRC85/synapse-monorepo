import { RegisterUserUseCase } from './register-user.use-case';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { RegisterUserDto } from '../dtos/register-user.dto';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      exists: jest.fn(), // Asegúrate de que el puerto tenga este método
    } as any;
    passwordHasher = {
      hash: jest.fn().mockResolvedValue('hashed_password'),
      compare: jest.fn(),
    };
    useCase = new RegisterUserUseCase(userRepository, passwordHasher);
  });

  it('debe registrar un usuario exitosamente', async () => {
    const dto: RegisterUserDto = {
      email: 'test@synapse.com',
      password: 'password123',
      tenantId: 'uuid-test',
    };
    userRepository.exists.mockResolvedValue(false);
    await useCase.execute(dto);
    expect(userRepository.save).toHaveBeenCalled();
  });
});