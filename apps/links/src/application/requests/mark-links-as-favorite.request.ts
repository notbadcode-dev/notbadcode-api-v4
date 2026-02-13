import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

import { LinksErrorMessageConstants } from '@apps/links/src/constants';

export class MarkLinksAsFavoriteRequest {
  @ApiProperty({ type: [Number], description: 'List of link IDs to mark as favorite', example: [1, 2, 3] })
  @IsArray({ message: LinksErrorMessageConstants.invalidPayload })
  @ArrayNotEmpty({ message: LinksErrorMessageConstants.arrayNotEmpty })
  @IsInt({ each: true, message: LinksErrorMessageConstants.invalidLinkId })
  linkIdList!: number[];
}
