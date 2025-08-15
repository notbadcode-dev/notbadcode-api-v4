import { Column, Entity } from 'typeorm';

import { DeletableEntity } from '@common/database';

@Entity({ name: 'users', database: 'auth_db' })
export class User extends DeletableEntity {
  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastLogoutAt?: Date | null;
}
