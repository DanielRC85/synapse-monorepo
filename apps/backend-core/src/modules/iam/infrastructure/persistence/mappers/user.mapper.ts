import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserOrmEntity } from '../entities/user.orm-entity';

export class UserMapper {
  static toOrm(domainUser: User): UserOrmEntity {
    const ormUser = new UserOrmEntity();
    ormUser.id = domainUser.id;
    ormUser.email = domainUser.email.value;
    ormUser.password = (domainUser as any).props.password; // Acceso controlado para persistencia
    ormUser.role = domainUser.role;
    ormUser.tenantId = domainUser.tenantId;
    ormUser.isActive = domainUser.isActive;
    return ormUser;
  }

  static toDomain(ormUser: UserOrmEntity): User {
    return User.create(
      {
        email: Email.create(ormUser.email),
        password: ormUser.password,
        role: ormUser.role,
        tenantId: ormUser.tenantId,
        isActive: ormUser.isActive,
      },
      ormUser.id,
    );
  }
}