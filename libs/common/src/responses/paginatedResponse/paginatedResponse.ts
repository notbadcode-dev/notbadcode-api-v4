import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponse<T> {
  @ApiProperty({ isArray: true })
  items!: T[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  take!: number;

  @ApiProperty({ required: false })
  skip?: number;

  @ApiProperty({ required: false })
  sortBy?: string;

  @ApiProperty({ required: false })
  sortOrder?: string;

  @ApiProperty({ required: false })
  filters?: Record<string, unknown>;

  @ApiProperty({ required: false })
  previousPage?: number;

  @ApiProperty({ required: false })
  currentPage?: number;

  @ApiProperty({ required: false })
  nextPage?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createPaginatedResponse = <TModel extends abstract new (...args: any[]) => any>(
  model: TModel,
): abstract new (...args: TModel[]) => {
  items: InstanceType<TModel>[];
  total: number;
  page: number;
  take: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: string;
  filters?: Record<string, unknown>;
  previousPage?: number;
  currentPage?: number;
  nextPage?: number;
} => {
  class PaginatedResponseForModel {
    @ApiProperty({ type: model, isArray: true })
    items!: InstanceType<TModel>[];

    @ApiProperty()
    total!: number;

    @ApiProperty()
    page!: number;

    @ApiProperty()
    take!: number;

    @ApiProperty({ required: false })
    skip?: number;

    @ApiProperty({ required: false })
    sortBy?: string;

    @ApiProperty({ required: false })
    sortOrder?: string;

    @ApiProperty({ required: false })
    filters?: Record<string, unknown>;

    @ApiProperty({ required: false })
    previousPage?: number;

    @ApiProperty({ required: false })
    currentPage?: number;

    @ApiProperty({ required: false })
    nextPage?: number;
  }
  return PaginatedResponseForModel;
};
