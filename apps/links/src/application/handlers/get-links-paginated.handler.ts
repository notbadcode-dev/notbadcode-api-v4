import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { type FindOptionsWhere } from 'typeorm';

import { BasePaginatedHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse, PaginatedResponse } from '@common/responses';

import { GetLinksPaginatedQuery } from '@apps/links/src/application/queries/get-links-paginated.query';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';
import { LinksErrorMessageConstants } from '@apps/links/src/constants/links-error-message.constants';
import { Link } from '@apps/links/src/domain/entities/link.entity';
import { type ILinkRepository } from '@apps/links/src/domain/ports/link-repository.port';

@QueryHandler(GetLinksPaginatedQuery)
export class GetLinksPaginatedHandler
  extends BasePaginatedHandler<GetLinksPaginatedQuery, Link, GetLinkByIdResponse>
  implements IQueryHandler<GetLinksPaginatedQuery, ApiResponse<PaginatedResponse<GetLinkByIdResponse>>>
{
  constructor(
    @Inject('ILinkRepository')
    private readonly linkRepository: ILinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(query: GetLinksPaginatedQuery): Promise<ApiResponse<PaginatedResponse<GetLinkByIdResponse>>> {
    const map = (link: Link): GetLinkByIdResponse =>
      plainToInstance(GetLinkByIdResponse, link, {
        excludeExtraneousValues: true,
      });

    const where = { userId: query.userId } as FindOptionsWhere<Link>;

    return this.executePaginated(this.linkRepository, query.request, map, LinksErrorMessageConstants.notFound, where, ['groupLink']);
  }
}
