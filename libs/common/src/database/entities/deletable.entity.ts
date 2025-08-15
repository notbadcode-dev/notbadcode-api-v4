import { DeleteDateColumn } from 'typeorm';

import { AuditableEntity } from './auditable.entity';

export abstract class DeletableEntity extends AuditableEntity {
  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt?: Date;
}
