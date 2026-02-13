import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { type FindOptionsWhere } from 'typeorm';

import { BasePaginatedHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse, PaginatedResponse } from '@common/responses';

import { GetGroupLinksPaginatedQuery } from '@apps/links/src/application/queries';
import { GetGroupLinkByIdResponse } from '@apps/links/src/application/responses';
import { GroupLinksErrorMessageConstants } from '@apps/links/src/constants';
import { GroupLink } from '@apps/links/src/domain/entities';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports';

@QueryHandler(GetGroupLinksPaginatedQuery)
export class GetGroupLinksPaginatedHandler
  extends BasePaginatedHandler<GetGroupLinksPaginatedQuery, GroupLink, GetGroupLinkByIdResponse>
  implements IQueryHandler<GetGroupLinksPaginatedQuery, ApiResponse<PaginatedResponse<GetGroupLinkByIdResponse>>>
{
  constructor(
    @Inject('IGroupLinkRepository')
    private readonly groupLinkRepository: IGroupLinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(query: GetGroupLinksPaginatedQuery): Promise<ApiResponse<PaginatedResponse<GetGroupLinkByIdResponse>>> {
    const map = (groupLink: GroupLink): GetGroupLinkByIdResponse =>
      plainToInstance(GetGroupLinkByIdResponse, groupLink, {
        excludeExtraneousValues: true,
      });

    const where = { userId: query.userId } as FindOptionsWhere<GroupLink>;

    return this.executePaginated(this.groupLinkRepository, query.request, map, GroupLinksErrorMessageConstants.notFound, where, ['links']);
  }
}
