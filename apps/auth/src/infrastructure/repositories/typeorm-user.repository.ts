import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@apps/auth/src/domain/entities/user.entity';
import { type IUserRepository } from '@apps/auth/src/domain/ports';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByIdAndEmail(id: number, email: string): Promise<User | null> {
    return this.repository.findOne({ where: { id, email } });
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  create(data: Partial<User>): User {
    return this.repository.create(data);
  }
}
