import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';


import { LinkBasicResponse } from './link-basic.response';

type GetGroupLinkByIdResponsePartial = Partial<GetGroupLinkByIdResponse>;

class RgbColorResponse {
  @ApiProperty()
  @Expose()
  r!: number;

  @ApiProperty()
  @Expose()
  g!: number;

  @ApiProperty()
  @Expose()
  b!: number;
}

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

  @ApiPropertyOptional({ type: RgbColorResponse, nullable: true, description: 'RGB color object { r, g, b }' })
  @Expose()
  @Type(() => RgbColorResponse)
  color?: RgbColorResponse | null;

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
