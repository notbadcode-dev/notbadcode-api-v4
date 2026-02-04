import { Column, Entity, Index, OneToMany } from 'typeorm';

import { LengthSizes } from '@common/constants';
import { DeletableEntity } from '@common/database';
import { ColumnBoolean, ColumnJsonRgb, ColumnVarchar, type RgbColor } from '@common/database/configurations/column-types';

import { Link } from './link.entity';

@Entity({ name: 'group_links' })
@Index('IX_group_links_userId', ['userId'])
@Index('IX_group_links_parentGroupLinkId', ['parentGroupLinkId'])
export class GroupLink extends DeletableEntity {
  @Column({ type: 'int', unsigned: true })
  userId!: number;

  @Column(ColumnVarchar(LengthSizes.regular))
  title!: string;

  @Column(ColumnVarchar(LengthSizes.medium, true))
  description?: string | null;

  @Column(ColumnJsonRgb())
  color?: RgbColor | null;

  @Column(ColumnVarchar(LengthSizes.regular, true))
  icon?: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  parentGroupLinkId?: number | null;

  @Column(ColumnBoolean())
  isFavorite!: boolean;

  @OneToMany(() => Link, (link) => link.groupLink)
  links?: Link[];
}
