import { In } from 'typeorm';

import { BaseHandler } from '@common/handler';
import type { I18nService } from '@common/i18n';
import type { ApiResponse, SuccessFailureResponse } from '@common/responses';

import type { IBaseRepository } from '@apps/links/src/domain/ports/base-repository.port';

import type { FindOptionsWhere } from 'typeorm';

type Favoritable = { id: number; userId: number; isFavorite: boolean };

/**
 * Generic base for Mark/Unmark as favorite handlers.
 * Provides a shared `markEntitiesAsFavorite` algorithm used by all four handlers.
 * Extends `BaseHandler` to inherit `createSuccessResponse` and error helpers.
 */
export abstract class BaseMarkAsFavoriteHandler<TCommand, TEntity extends Favoritable> extends BaseHandler<TCommand, ApiResponse<SuccessFailureResponse<number>>> {
  constructor(i18nService: I18nService) {
    super(i18nService);
  }

  protected async markEntitiesAsFavorite(
    repository: IBaseRepository<TEntity>,
    idList: number[],
    userId: number,
    isFavorite: boolean,
  ): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    const result: SuccessFailureResponse<number> = {
      successList: [],
      failureList: [],
    };

    if (!idList.length) {
      return this.createSuccessResponse(result);
    }

    const existingEntities = await repository.find({
      select: ['id'] as (keyof TEntity)[],
      where: { id: In(idList), userId } as FindOptionsWhere<TEntity>,
    });

    const existingIds = existingEntities.map((e) => e.id);
    const notFoundIds = idList.filter((id) => !existingIds.includes(id));
    result.failureList.push(...notFoundIds);

    if (!existingIds.length) {
      return this.createSuccessResponse(result);
    }

    const updateResult = await repository.update({ id: In(existingIds), userId } as FindOptionsWhere<TEntity>, { isFavorite } as Partial<TEntity>);

    const affected = updateResult.affected ?? 0;

    if (affected === existingIds.length) {
      result.successList.push(...existingIds);
    } else {
      result.successList.push(...existingIds.slice(0, affected));
      result.failureList.push(...existingIds.slice(affected));
    }

    return this.createSuccessResponse(result);
  }
}
