import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

import { PaginatedConstants } from '@common/constants';
import { EPaginatedOrder } from '@common/enums/paginated-order.enum';

export class PaginatedRequest {
  @ApiPropertyOptional({ type: Number, default: PaginatedConstants.DEFAULT_SKIP })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  skip = PaginatedConstants.DEFAULT_SKIP;

  @ApiProperty({ type: Number, default: PaginatedConstants.DEFAULT_TAKE })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  take = PaginatedConstants.DEFAULT_TAKE;

  @ApiPropertyOptional({ type: Number })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  previousPage?: number;

  @ApiPropertyOptional({ type: Number, default: PaginatedConstants.DEFAULT_FIRST_PAGE })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  currentPage = PaginatedConstants.DEFAULT_FIRST_PAGE;

  @ApiPropertyOptional({ type: Number })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  nextPage?: number;

  @ApiPropertyOptional({ type: Number, default: PaginatedConstants.DEFAULT_TOTAL_ITEMS })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  totalItems = PaginatedConstants.DEFAULT_TOTAL_ITEMS;

  @ApiPropertyOptional({ type: String, default: PaginatedConstants.DEFAULT_SORT_BY })
  @IsString()
  sortBy = PaginatedConstants.DEFAULT_SORT_BY;

  @ApiPropertyOptional({ enum: EPaginatedOrder, default: EPaginatedOrder.DESC })
  @IsEnum(EPaginatedOrder)
  sortOrder = EPaginatedOrder.DESC;
}
