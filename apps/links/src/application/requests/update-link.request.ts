import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsBoolean, IsString, IsUrl, MaxLength } from 'class-validator';

import { LengthSizes } from '@common/constants';

export class UpdateLinkRequest {
  @ApiProperty({ maxLength: LengthSizes.extraLarge })
  @IsString()
  @IsUrl()
  @MaxLength(LengthSizes.extraLarge)
  url!: string;

  @ApiProperty({ maxLength: LengthSizes.regular })
  @IsString()
  @MaxLength(LengthSizes.regular)
  title!: string;

  @ApiProperty({ maxLength: LengthSizes.medium })
  @IsString()
  @MaxLength(LengthSizes.medium)
  description!: string;

  @ApiProperty()
  @IsBoolean()
  isFavorite!: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(LengthSizes.small)
  @IsString({ each: true })
  @MaxLength(LengthSizes.regular, { each: true })
  tagList!: string[];
}
