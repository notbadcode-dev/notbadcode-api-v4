import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { LinkLastStatusCode } from '@apps/links/src/domain/enums';

import { GroupLinkBasicResponse } from './group-link-basic.response';

type NullableString = string | null;
type LinkStatusCode = LinkLastStatusCode;
type GetLinkByIdResponsePartial = Partial<GetLinkByIdResponse>;

@Exclude()
export class GetLinkByIdResponse {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  url!: string;

  @ApiProperty({ required: false })
  @Expose()
  normalizedUrl?: string;

  @ApiProperty({ required: false })
  @Expose()
  title?: NullableString;

  @ApiProperty({ required: false })
  @Expose()
  description?: NullableString;

  @ApiProperty({ required: false })
  @Expose()
  faviconUrl?: NullableString;

  @ApiProperty({ required: false })
  @Expose()
  imagePreviewUrl?: NullableString;

  @ApiProperty({ type: Number, required: false, nullable: true })
  @Expose()
  groupLinkId?: number | null;

  @ApiPropertyOptional({ type: () => GroupLinkBasicResponse, nullable: true })
  @Expose()
  @Type(() => GroupLinkBasicResponse)
  groupLink?: GroupLinkBasicResponse | null;

  @ApiProperty()
  @Expose()
  isFavorite!: boolean;

  @ApiProperty({ type: [String], required: false })
  @Expose()
  tagList?: string[];

  @ApiProperty()
  @Expose()
  isActive!: boolean;

  @ApiProperty({ enum: LinkLastStatusCode })
  @Expose()
  lastStatusCode!: LinkStatusCode;

  @ApiProperty({ type: String, required: false })
  @Expose()
  lastCheckedAt?: Date | null;

  @ApiProperty({ type: String, required: false })
  @Expose()
  lastVisitedAt?: Date | null;

  constructor(partial?: GetLinkByIdResponsePartial) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
