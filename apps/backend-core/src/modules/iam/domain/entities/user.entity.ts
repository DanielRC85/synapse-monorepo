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
      isActive: props.isActive ?? true,
    }, id);
  }

  // Getters para exponer estado de forma segura
  get email(): Email { return this.props.email; }
  get role(): UserRole { return this.props.role; }
  get tenantId(): string { return this.props.tenantId; }
  get isActive(): boolean { return this.props.isActive; }

  /**
   * Lógica de dominio: Desactivar usuario
   */
  public deactivate(): void {
    this.props.isActive = false;
    this.updateTimestamp();
  }
}