import { type User } from '@apps/auth/src/domain/entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByIdAndEmail(id: number, email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  create(data: Partial<User>): User;
}
