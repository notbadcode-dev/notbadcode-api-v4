import { Column, Entity } from 'typeorm';

import { LengthSizes } from '@common/constants';
import { DeletableEntity } from '@common/database';
import { ColumnDateTimeNullable, ColumnVarchar } from '@common/database/configurations/column-types';

@Entity({ name: 'users' })
export class User extends DeletableEntity {
  @Column({ ...ColumnVarchar(LengthSizes.regular), unique: true })
  email!: string;

  @Column(ColumnVarchar(LengthSizes.regular))
  passwordHash!: string;

  @Column(ColumnDateTimeNullable())
  lastLoginAt?: Date | null;

  @Column(ColumnDateTimeNullable())
  lastLogoutAt?: Date | null;
}
