import { User } from '../entities/user.entity';

export interface UserRepositoryPort {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  exists(email: string): Promise<boolean>; 
}

export const USER_REPOSITORY_PORT = Symbol('UserRepositoryPort');