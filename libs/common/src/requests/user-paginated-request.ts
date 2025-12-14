import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { PaginatedRequest } from './paginated-request';

export class UserPaginatedRequest extends PaginatedRequest {
  @ApiProperty({ type: Number })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  userId!: number;
}
