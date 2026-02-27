import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { I18nService } from '@common/i18n';
import { apiResponseSuccess, type ApiResponse } from '@common/responses';

import { GetFavoriteGroupsQuery } from '@apps/links/src/application/queries/get-favorite-groups.query';
import { GetFavoriteGroupsResponse } from '@apps/links/src/application/responses/get-favorite-groups.response';
import { GetGroupLinkByIdResponse } from '@apps/links/src/application/responses/get-group-link-by-id.response';
import { LinksConstants } from '@apps/links/src/constants';
import { GROUP_LINK_REPOSITORY_TOKEN } from '@apps/links/src/domain/ports';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports/group-link-repository.port';

@QueryHandler(GetFavoriteGroupsQuery)
export class GetFavoriteGroupsHandler implements IQueryHandler<GetFavoriteGroupsQuery, ApiResponse<GetFavoriteGroupsResponse>> {
  constructor(
    @Inject(GROUP_LINK_REPOSITORY_TOKEN)
    private readonly groupLinkRepository: IGroupLinkRepository,
    private readonly i18nService: I18nService,
  ) {}

  async execute(query: GetFavoriteGroupsQuery): Promise<ApiResponse<GetFavoriteGroupsResponse>> {
    const [groups] = await this.groupLinkRepository.findAndCount({
      where: {
        userId: query.userId,
        isFavorite: true,
      },
      relations: ['links'],
      skip: 0,
      take: LinksConstants.favoriteListMaxSize,
    });

    const groupLinkList = groups.map((group) =>
      plainToInstance(GetGroupLinkByIdResponse, group, {
        excludeExtraneousValues: true,
      }),
    );

    return apiResponseSuccess(this.i18nService, new GetFavoriteGroupsResponse({ groupLinkList }));
  }
}
