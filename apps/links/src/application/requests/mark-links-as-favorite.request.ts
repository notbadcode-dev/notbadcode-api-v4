import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

import { LinksErrorMessageConstants } from '../../constants/links-error-message.constants';

export class MarkLinksAsFavoriteRequest {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayNotEmpty({ message: LinksErrorMessageConstants.arrayNotEmpty })
  @IsInt({ each: true })
  linkIdList!: number[];
}
