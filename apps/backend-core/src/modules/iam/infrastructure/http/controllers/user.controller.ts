import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Get, 
  UseGuards 
} from '@nestjs/common';

// DTOs
import { RegisterUserDto } from '../../../application/dtos/register-user.dto';
import { LoginUserDto, AuthResponseDto } from '../../../application/dtos/auth.dto';

// Casos de Uso
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../../application/use-cases/login-user.use-case';

// Seguridad (Infraestructura)
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

// Tipos de Dominio (Opcional, para mejor tipado en el decorador)
import type { TokenPayload } from '../../../domain/ports/token-service.port';

@Controller('iam')
export class UserController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto): Promise<{ message: string }> {
    await this.registerUserUseCase.execute(dto);
    return {
      message: 'Usuario registrado exitosamente',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    return this.loginUserUseCase.execute(dto);
  }

  @Get('profile')
  @UseGuards(AuthGuard) // El "Guardaespaldas" valida el token antes de entrar aquí
  async getProfile(@CurrentUser() user: TokenPayload) {
    return {
      message: 'Acceso concedido',
      user // Contiene sub (ID), email, role y tenantId
    };
  }
}