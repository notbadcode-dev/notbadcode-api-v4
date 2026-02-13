import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

import { GroupLinksErrorMessageConstants } from '@apps/links/src/constants';

export class UnmarkGroupLinksAsFavoriteRequest {
  @ApiProperty({ type: [Number], description: 'List of group link IDs to unmark as favorite', example: [1, 2, 3] })
  @IsArray({ message: GroupLinksErrorMessageConstants.invalidPayload })
  @ArrayNotEmpty({ message: GroupLinksErrorMessageConstants.arrayNotEmpty })
  @IsInt({ each: true, message: GroupLinksErrorMessageConstants.invalidGroupLinkId })
  groupLinkIdList!: number[];
}
