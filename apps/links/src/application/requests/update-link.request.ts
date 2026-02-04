import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

import { LengthSizes } from '@common/constants';

import { LinksErrorMessageConstants } from '../../constants/links-error-message.constants';

export class UpdateLinkRequest {
  @ApiPropertyOptional({ description: 'Link URL', example: 'https://example.com', maxLength: LengthSizes.extraLarge })
  @IsOptional()
  @IsString({ message: LinksErrorMessageConstants.invalidUrl })
  @IsUrl({}, { message: LinksErrorMessageConstants.invalidUrl })
  @MaxLength(LengthSizes.extraLarge, { message: LinksErrorMessageConstants.invalidUrl })
  url?: string;

  @ApiPropertyOptional({ description: 'Link title', example: 'My favorite article', maxLength: LengthSizes.regular })
  @IsOptional()
  @IsString({ message: LinksErrorMessageConstants.invalidTitle })
  @IsNotEmpty({ message: LinksErrorMessageConstants.invalidTitle })
  @MaxLength(LengthSizes.regular, { message: LinksErrorMessageConstants.invalidTitle })
  title?: string;

  @ApiPropertyOptional({ description: 'Link description', example: 'An interesting read about NestJS', maxLength: LengthSizes.medium })
  @IsOptional()
  @IsString({ message: LinksErrorMessageConstants.descriptionRequired })
  @MaxLength(LengthSizes.medium, { message: LinksErrorMessageConstants.descriptionRequired })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the link is marked as favorite', example: false })
  @IsOptional()
  @IsBoolean({ message: LinksErrorMessageConstants.invalidFavoriteFlag })
  isFavorite?: boolean;

  @ApiPropertyOptional({ description: 'List of tags associated with the link', example: ['nestjs', 'typescript'], type: [String] })
  @IsOptional()
  @IsArray({ message: LinksErrorMessageConstants.invalidTagList })
  @ArrayMaxSize(LengthSizes.small, { message: LinksErrorMessageConstants.invalidTagList })
  @IsString({ each: true, message: LinksErrorMessageConstants.invalidTagList })
  @MaxLength(LengthSizes.regular, { each: true, message: LinksErrorMessageConstants.invalidTagList })
  tagList?: string[];

  @ApiPropertyOptional({ description: 'Group link ID to assign this link to (null to remove from group)', example: 1, type: Number, nullable: true })
  @IsOptional()
  @IsInt({ message: LinksErrorMessageConstants.invalidGroupLinkId })
  @Min(1, { message: LinksErrorMessageConstants.invalidGroupLinkId })
  groupLinkId?: number | null;
}
