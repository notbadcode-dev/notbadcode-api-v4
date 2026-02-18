import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { CommonErrorMessageConstants, PaginatedConstants } from '@common/constants';
import { EPaginatedOrder } from '@common/enums/paginated-order.enum';

export class PaginatedRequest {
  @ApiPropertyOptional({ description: 'Number of items to skip', type: Number, example: 0, default: PaginatedConstants.DEFAULT_SKIP })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: CommonErrorMessageConstants.invalidSkip })
  @Min(0, { message: CommonErrorMessageConstants.invalidSkip })
  skip = PaginatedConstants.DEFAULT_SKIP;

  @ApiPropertyOptional({ description: 'Number of items per page', type: Number, example: 10, default: PaginatedConstants.DEFAULT_TAKE })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: CommonErrorMessageConstants.invalidTake })
  @Min(1, { message: CommonErrorMessageConstants.invalidTake })
  take = PaginatedConstants.DEFAULT_TAKE;

  @ApiPropertyOptional({ description: 'Current page number', type: Number, example: 1, default: PaginatedConstants.DEFAULT_FIRST_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: CommonErrorMessageConstants.invalidCurrentPage })
  @Min(1, { message: CommonErrorMessageConstants.invalidCurrentPage })
  currentPage = PaginatedConstants.DEFAULT_FIRST_PAGE;

  @ApiPropertyOptional({ description: 'Field name to sort by', type: String, example: 'id', default: PaginatedConstants.DEFAULT_SORT_BY })
  @IsOptional()
  @IsString({ message: CommonErrorMessageConstants.invalidSortBy })
  sortBy = PaginatedConstants.DEFAULT_SORT_BY;

  @ApiPropertyOptional({ description: 'Sort direction', enum: EPaginatedOrder, enumName: 'EPaginatedOrder', example: EPaginatedOrder.DESC, default: EPaginatedOrder.DESC })
  @IsOptional()
  @IsEnum(EPaginatedOrder, { message: CommonErrorMessageConstants.invalidSortOrder })
  sortOrder = EPaginatedOrder.DESC;
}
