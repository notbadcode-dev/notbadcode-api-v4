import { type FindOptionsOrder, type ObjectLiteral } from 'typeorm';

import { PaginatedConstants } from '@common/constants';
import { type PaginatedRequest } from '@common/requests';

export class PaginateHelper {
  static buildPaginatedResponse<T>({ items, total, request }: { items: T[]; total: number; request: PaginatedRequest }): {
    items: T[];
    total: number;
    take: number;
    skip: number;
    sortBy?: string;
    sortOrder?: string;
    previousPage?: number;
    currentPage: number;
    nextPage?: number;
  } {
    const page = PaginateHelper.getPage(request);
    const take = PaginateHelper.getTake(request, request.take);
    const skip = PaginateHelper.getSkip(request, page, take);
    const totalPages = Math.ceil(total / take);

    return {
      items,
      total,
      take,
      skip,
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
      previousPage: page > 1 ? page - 1 : undefined,
      currentPage: page,
      nextPage: page < totalPages ? page + 1 : undefined,
    };
  }

  static calculateRepositoryPagination<TEntity extends ObjectLiteral>(
    request: PaginatedRequest,
  ): {
    skip: number;
    take: number;
    order?: FindOptionsOrder<TEntity>;
  } {
    const page = PaginateHelper.getPage(request);
    const take = PaginateHelper.getPageSize(request);
    const skip = PaginateHelper.getSkip(request, page, take);

    let order: FindOptionsOrder<TEntity> | undefined;

    if (request.sortBy) {
      order = {
        [request.sortBy]: request.sortOrder ?? PaginatedConstants.DEFAULT_SORT_ORDER,
      } as FindOptionsOrder<TEntity>;
    } else {
      order = {
        [PaginatedConstants.DEFAULT_SORT_BY]: PaginatedConstants.DEFAULT_SORT_ORDER,
      } as FindOptionsOrder<TEntity>;
    }

    return { skip, take, order };
  }

  private static getPage(request: PaginatedRequest): number {
    return request.currentPage && request.currentPage > 0 ? request.currentPage : PaginatedConstants.DEFAULT_FIRST_PAGE;
  }

  private static getPageSize(request: PaginatedRequest): number {
    return request.take && request.take > 0 ? request.take : PaginatedConstants.DEFAULT_TAKE;
  }

  private static getSkip(request: PaginatedRequest, page: number, take: number): number {
    if (typeof request.skip === 'number') {
      return request.skip;
    }
    return (page - 1) * take;
  }

  private static getTake(request: PaginatedRequest, take: number): number {
    return typeof request.take === 'number' ? request.take : take;
  }
}
