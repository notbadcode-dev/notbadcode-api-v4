import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

import { LengthSizes } from '@common/constants';

import { GroupLinksErrorMessageConstants } from '@apps/links/src/constants';

class RgbColorDto {
  @ApiPropertyOptional({ description: 'Red component (0-255)', example: 255 })
  @IsInt({ message: GroupLinksErrorMessageConstants.invalidColor })
  @Min(0, { message: GroupLinksErrorMessageConstants.invalidColor })
  @Max(255, { message: GroupLinksErrorMessageConstants.invalidColor })
  r!: number;

  @ApiPropertyOptional({ description: 'Green component (0-255)', example: 128 })
  @IsInt({ message: GroupLinksErrorMessageConstants.invalidColor })
  @Min(0, { message: GroupLinksErrorMessageConstants.invalidColor })
  @Max(255, { message: GroupLinksErrorMessageConstants.invalidColor })
  g!: number;

  @ApiPropertyOptional({ description: 'Blue component (0-255)', example: 0 })
  @IsInt({ message: GroupLinksErrorMessageConstants.invalidColor })
  @Min(0, { message: GroupLinksErrorMessageConstants.invalidColor })
  @Max(255, { message: GroupLinksErrorMessageConstants.invalidColor })
  b!: number;
}

export class UpdateGroupLinkRequest {
  @ApiPropertyOptional({ description: 'Group link title', example: 'My Group', maxLength: LengthSizes.regular })
  @IsOptional()
  @IsString({ message: GroupLinksErrorMessageConstants.invalidTitle })
  @IsNotEmpty({ message: GroupLinksErrorMessageConstants.invalidTitle })
  @MaxLength(LengthSizes.regular, { message: GroupLinksErrorMessageConstants.invalidTitle })
  title?: string;

  @ApiPropertyOptional({ description: 'Group link description', example: 'A collection of useful links', maxLength: LengthSizes.medium })
  @IsOptional()
  @IsString({ message: GroupLinksErrorMessageConstants.invalidDescription })
  @MaxLength(LengthSizes.medium, { message: GroupLinksErrorMessageConstants.invalidDescription })
  description?: string | null;

  @ApiPropertyOptional({ type: RgbColorDto, description: 'RGB color object { r, g, b }', example: { r: 255, g: 128, b: 0 } })
  @IsOptional()
  @IsObject({ message: GroupLinksErrorMessageConstants.invalidColor })
  @ValidateNested()
  @Type(() => RgbColorDto)
  color?: RgbColorDto | null;

  @ApiPropertyOptional({ description: 'Icon identifier', example: 'folder', maxLength: LengthSizes.regular })
  @IsOptional()
  @IsString({ message: GroupLinksErrorMessageConstants.invalidIcon })
  @MaxLength(LengthSizes.regular, { message: GroupLinksErrorMessageConstants.invalidIcon })
  icon?: string | null;

  @ApiPropertyOptional({ description: 'Parent group link ID (null to remove from parent)', example: 1, type: Number, nullable: true })
  @IsOptional()
  @IsInt({ message: GroupLinksErrorMessageConstants.invalidParentGroupLinkId })
  @Min(1, { message: GroupLinksErrorMessageConstants.invalidParentGroupLinkId })
  parentGroupLinkId?: number | null;

  @ApiPropertyOptional({ description: 'Whether the group is marked as favorite', example: false })
  @IsOptional()
  @IsBoolean({ message: GroupLinksErrorMessageConstants.invalidFavoriteFlag })
  isFavorite?: boolean;
}
