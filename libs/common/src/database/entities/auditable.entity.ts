import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ColumnDateTimeNonNullable } from '@common/database/configurations/column-types';

export abstract class AuditableEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @CreateDateColumn(ColumnDateTimeNonNullable())
  createdAt!: Date;

  @UpdateDateColumn(ColumnDateTimeNonNullable())
  updatedAt!: Date;
}
