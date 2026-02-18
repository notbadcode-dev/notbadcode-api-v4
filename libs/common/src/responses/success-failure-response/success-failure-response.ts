import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class SuccessFailureResponse<T> {
  @ApiProperty({ isArray: true, description: 'List of successfully processed items' })
  @IsArray()
  successList!: T[];

  @ApiProperty({ isArray: true, description: 'List of items that failed to process' })
  @IsArray()
  failureList!: T[];
}
