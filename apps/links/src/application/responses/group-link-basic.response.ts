import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { type RgbColor } from '@common/database/configurations/column-types';

type GroupLinkBasicResponsePartial = Partial<GroupLinkBasicResponse>;

@Exclude()
export class GroupLinkBasicResponse {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiPropertyOptional({ type: Object, nullable: true, description: 'RGB color object { r, g, b }' })
  @Expose()
  color?: RgbColor | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  icon?: string | null;

  constructor(partial?: GroupLinkBasicResponsePartial) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
