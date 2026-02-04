import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { type RgbColor } from '@common/database/configurations/column-types';

import { LinkBasicResponse } from './link-basic.response';

type GetGroupLinkByIdResponsePartial = Partial<GetGroupLinkByIdResponse>;

@Exclude()
export class GetGroupLinkByIdResponse {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  description?: string | null;

  @ApiPropertyOptional({ type: Object, nullable: true, description: 'RGB color object { r, g, b }' })
  @Expose()
  color?: RgbColor | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  icon?: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @Expose()
  parentGroupLinkId?: number | null;

  @ApiProperty()
  @Expose()
  isFavorite!: boolean;

  @ApiPropertyOptional({ type: () => [LinkBasicResponse], nullable: true })
  @Expose()
  @Type(() => LinkBasicResponse)
  links?: LinkBasicResponse[];

  constructor(partial?: GetGroupLinkByIdResponsePartial) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
