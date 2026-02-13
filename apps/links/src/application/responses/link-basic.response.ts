import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { LinkLastStatusCode } from '@apps/links/src/domain/enums';

type NullableString = string | null;
type LinkStatusCode = LinkLastStatusCode;
type LinkBasicResponsePartial = Partial<LinkBasicResponse>;

@Exclude()
export class LinkBasicResponse {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  url!: string;

  @ApiPropertyOptional()
  @Expose()
  title?: NullableString;

  @ApiPropertyOptional()
  @Expose()
  faviconUrl?: NullableString;

  @ApiProperty()
  @Expose()
  isFavorite!: boolean;

  @ApiProperty()
  @Expose()
  isActive!: boolean;

  @ApiProperty({ enum: LinkLastStatusCode })
  @Expose()
  lastStatusCode!: LinkStatusCode;

  constructor(partial?: LinkBasicResponsePartial) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
