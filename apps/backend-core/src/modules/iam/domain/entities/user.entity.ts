import { AggregateRoot } from '../../../../shared/domain/types/aggregate-root.base';
import { Email } from '../value-objects/email.vo';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

interface UserProps {
  email: Email;
  password: string; // Hash
  role: UserRole;
  tenantId: string;
  isActive: boolean;
}

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  public static create(props: UserProps, id?: string): User {
    return new User({
      ...props,
      // Aseguramos que si no viene isActive, sea true por defecto
      isActive: props.isActive ?? true,
    }, id);
  }

  // --- GETTERS (Exponer estado de forma segura) ---

  get email(): Email { 
    return this.props.email; 
  }

  // 👇 ¡ESTO ES LO QUE FALTABA! 👇
  // Necesario para que el LoginUseCase pueda leer el hash y compararlo con bcrypt.
  get password(): string { 
    return this.props.password; 
  }

  get role(): UserRole { 
    return this.props.role; 
  }

  get tenantId(): string { 
    return this.props.tenantId; 
  }

  get isActive(): boolean { 
    return this.props.isActive; 
  }

  // --- COMPORTAMIENTO (Lógica de Negocio) ---

  /**
   * Desactivar usuario (Soft Delete o bloqueo)
   */
  public deactivate(): void {
    this.props.isActive = false;
    this.updateTimestamp(); // Actualiza updatedAt si tu clase base lo soporta
  }
}