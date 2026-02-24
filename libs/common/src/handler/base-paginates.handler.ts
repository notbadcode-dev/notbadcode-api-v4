import { HttpStatus } from '@nestjs/common';
import { type FindOptionsOrder, type FindOptionsWhere, type ObjectLiteral } from 'typeorm';

import { PaginateHelper } from '@common/helpers';
import { type I18nService } from '@common/i18n';
import { type PaginatedRequest } from '@common/requests';
import { type ApiResponse, type PaginatedResponse } from '@common/responses';

import { BaseHandler } from './base.handler';

export interface IPaginatableRepository<TEntity extends ObjectLiteral> {
  findAndCount(options: { skip: number; take: number; order?: FindOptionsOrder<TEntity>; where?: FindOptionsWhere<TEntity>; relations?: string[] }): Promise<[TEntity[], number]>;
}

export abstract class BasePaginatedHandler<TCommand, TEntity extends ObjectLiteral, TResponseDto> extends BaseHandler<TCommand, ApiResponse<PaginatedResponse<TResponseDto>>> {
  protected constructor(protected readonly i18nService: I18nService) {
    super(i18nService);
  }

  protected async executePaginated(
    repository: IPaginatableRepository<TEntity>,
    request: PaginatedRequest,
    map: (entity: TEntity) => TResponseDto,
    notFoundMessage: string,
    where?: FindOptionsWhere<TEntity>,
    relations?: string[],
  ): Promise<ApiResponse<PaginatedResponse<TResponseDto>>> {
    const { skip, take, order } = PaginateHelper.calculateRepositoryPagination<TEntity>(request);

    const [entities, total] = await repository.findAndCount({ skip, take, order, where, relations });

    if (!entities.length) {
      return this.createResponseFailure(notFoundMessage, HttpStatus.NOT_FOUND);
    }

    const items = entities.map(map);

    const response = PaginateHelper.buildPaginatedResponse({
      items,
      total,
      request,
    });

    return this.createSuccessResponse(response);
  }
}
