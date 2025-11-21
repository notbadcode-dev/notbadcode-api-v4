import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { LinkLastStatusCode } from '../../domain/enums/link-last-status-code.enum';

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
  title?: string | null;

  @ApiProperty({ required: false })
  @Expose()
  description?: string | null;

  @ApiProperty({ required: false })
  @Expose()
  faviconUrl?: string | null;

  @ApiProperty({ required: false })
  @Expose()
  imagePreviewUrl?: string | null;

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
  lastStatusCode!: LinkLastStatusCode;

  @ApiProperty({ type: String, required: false })
  @Expose()
  lastCheckedAt?: Date | null;

  @ApiProperty({ type: String, required: false })
  @Expose()
  lastVisitedAt?: Date | null;

  constructor(partial: Partial<GetLinkByIdResponse>) {
    Object.assign(this, partial);
  }
}
