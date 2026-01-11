import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UserRepositoryPort } from '../../../domain/ports/user.repository.port';
import { User } from '../../../domain/entities/user.entity';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<void> {
    const ormUser = UserMapper.toOrm(user);
    await this.repository.save(ormUser);
  }

  async exists(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  async findByEmail(email: string): Promise<User | null> {
    const ormUser = await this.repository.findOne({ where: { email } });
    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }

  async findById(id: string): Promise<User | null> {
    const ormUser = await this.repository.findOne({ where: { id } });
    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }
}