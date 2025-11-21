import { Column, Entity, Index } from 'typeorm';

import { LengthSizes } from '@common/constants';
import { DeletableEntity } from '@common/database';
import { ColumnBoolean, ColumnDateTimeNullable, ColumnEnumNonNullable, ColumnJsonArray, ColumnVarchar } from '@common/database/configurations/column-types';

import { LinkLastStatusCode } from '../enums/link-last-status-code.enum';

@Entity({ name: 'links', database: 'links_db' })
@Index('IX_links_userId', ['userId'])
@Index('IX_links_isFavorite', ['isFavorite'])
@Index('IX_links_isActive', ['isActive'])
@Index('UX_links_user_normalizedUrl', ['userId', 'normalizedUrl'], { unique: true })
export class Link extends DeletableEntity {
  @Column()
  userId!: number;

  @Column(ColumnVarchar(LengthSizes.extraLarge))
  url!: string;

  @Column(ColumnVarchar(LengthSizes.extraLarge))
  normalizedUrl?: string;

  @Column(ColumnVarchar(LengthSizes.regular))
  title?: string | null;

  @Column(ColumnVarchar(LengthSizes.medium))
  description?: string | null;

  @Column(ColumnVarchar(LengthSizes.large))
  faviconUrl?: string | null;

  @Column(ColumnVarchar(LengthSizes.extraLarge))
  imagePreviewUrl?: string | null;

  @Column(ColumnBoolean())
  isFavorite!: boolean;

  @Column(ColumnJsonArray())
  tagList?: string[];

  @Column(ColumnBoolean())
  isActive!: boolean;

  @Column(ColumnEnumNonNullable(LinkLastStatusCode, LinkLastStatusCode.PENDING))
  lastStatusCode!: LinkLastStatusCode;

  @Column(ColumnDateTimeNullable())
  lastCheckedAt?: Date | null;

  @Column(ColumnDateTimeNullable())
  lastVisitedAt?: Date | null;
}
