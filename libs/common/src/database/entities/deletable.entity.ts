import { DeleteDateColumn } from 'typeorm';

import { ColumnDateTimeNullable } from '@common/database/configurations/column-types';
import { AuditableEntity } from './auditable.entity';

export abstract class DeletableEntity extends AuditableEntity {
  @DeleteDateColumn(ColumnDateTimeNullable())
  deletedAt?: Date;
}