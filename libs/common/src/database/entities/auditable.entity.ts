import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ColumnDateTimeNullable } from '../configurations/column-types';

export abstract class AuditableEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn(ColumnDateTimeNullable())
  createdAt!: Date;

  @UpdateDateColumn(ColumnDateTimeNullable())
  updatedAt!: Date;
}
