import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { LengthSizes } from '@common/constants';
import { DeletableEntity } from '@common/database';
import { ColumnBoolean, ColumnDateTimeNullable, ColumnEnumNonNullable, ColumnJsonArray, ColumnVarchar } from '@common/database/configurations/column-types';

import { LinkLastStatusCode } from '@apps/links/src/domain/enums';

import { GroupLink } from './group-link.entity';

@Entity({ name: 'links' })
@Index('IX_links_userId', ['userId'])
@Index('IX_links_groupLinkId', ['groupLinkId'])
@Index('IX_links_isFavorite', ['isFavorite'])
@Index('IX_links_isActive', ['isActive'])
@Index('UX_links_user_normalizedUrl', ['userId', 'normalizedUrl'], { unique: true })
export class Link extends DeletableEntity {
  @Column({ type: 'int', unsigned: true })
  userId!: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  groupLinkId?: number | null;

  @ManyToOne(() => GroupLink, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'groupLinkId' })
  groupLink?: GroupLink | null;

  @Column(ColumnVarchar(LengthSizes.extraLarge))
  url!: string;

  @Column(ColumnVarchar(LengthSizes.extraLarge, true))
  normalizedUrl?: string | null;

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

  @Column(ColumnBoolean(true))
  isActive!: boolean;

  @Column(ColumnEnumNonNullable(LinkLastStatusCode, LinkLastStatusCode.PENDING))
  lastStatusCode!: LinkLastStatusCode;

  @Column(ColumnDateTimeNullable())
  lastCheckedAt?: Date | null;

  @Column(ColumnDateTimeNullable())
  lastVisitedAt?: Date | null;

  static build(props: {
    userId: number;
    url: string;
    normalizedUrl: string;
    title?: string | null;
    description?: string | null;
    isFavorite?: boolean;
    tagList?: string[];
    groupLinkId?: number | null;
  }): Link {
    return Object.assign(new Link(), {
      userId: props.userId,
      url: props.url,
      normalizedUrl: props.normalizedUrl,
      title: props.title ?? null,
      description: props.description ?? null,
      faviconUrl: null,
      imagePreviewUrl: null,
      isFavorite: props.isFavorite ?? false,
      tagList: props.tagList ?? [],
      isActive: true,
      lastStatusCode: LinkLastStatusCode.PENDING,
      lastCheckedAt: null,
      lastVisitedAt: null,
      groupLinkId: props.groupLinkId ?? null,
    });
  }
}
