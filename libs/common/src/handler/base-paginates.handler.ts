import { type FindOptionsOrder, type ObjectLiteral } from 'typeorm';

import { PaginateHelper } from '@common/helpers';
import { type I18nService } from '@common/i18n';
import { type UserPaginatedRequest } from '@common/requests';
import { type ApiResponse, type PaginatedResponse } from '@common/responses';

import { BaseHandler } from './base.handler';

export interface IPaginatableRepository<TEntity extends ObjectLiteral> {
  findAndCount(options: { skip: number; take: number; order?: FindOptionsOrder<TEntity> }): Promise<[TEntity[], number]>;
}

export abstract class BasePaginatedHandler<TCommand, TEntity extends ObjectLiteral, TResponseDto> extends BaseHandler<TCommand, ApiResponse<PaginatedResponse<TResponseDto>>> {
  protected constructor(protected readonly i18nService: I18nService) {
    super(i18nService);
  }

  protected async executePaginated(
    repository: IPaginatableRepository<TEntity>,
    request: UserPaginatedRequest,
    map: (entity: TEntity) => TResponseDto,
    notFoundMessage: string,
  ): Promise<ApiResponse<PaginatedResponse<TResponseDto>>> {
    const { skip, take, order } = PaginateHelper.calculateRepositoryPagination<TEntity>(request);

    const [entities, total] = await repository.findAndCount({ skip, take, order });

    if (!entities.length) {
      return this.createResponseFailure(notFoundMessage);
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
