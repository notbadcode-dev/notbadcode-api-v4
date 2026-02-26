import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { IsNull } from 'typeorm';

import { I18nService } from '@common/i18n';
import { apiResponseSuccess, type ApiResponse } from '@common/responses';

import { GetFavoriteLinksQuery } from '@apps/links/src/application/queries/get-favorite-links.query';
import { GetFavoriteLinksResponse } from '@apps/links/src/application/responses/get-favorite-links.response';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';
import { type ILinkRepository } from '@apps/links/src/domain/ports/link-repository.port';

@QueryHandler(GetFavoriteLinksQuery)
export class GetFavoriteLinksHandler implements IQueryHandler<GetFavoriteLinksQuery, ApiResponse<GetFavoriteLinksResponse>> {
  constructor(
    @Inject('ILinkRepository')
    private readonly linkRepository: ILinkRepository,
    private readonly i18nService: I18nService,
  ) {}

  async execute(query: GetFavoriteLinksQuery): Promise<ApiResponse<GetFavoriteLinksResponse>> {
    const links = await this.linkRepository.find({
      where: {
        userId: query.userId,
        isFavorite: true,
        groupLinkId: IsNull(),
      },
    });

    const linkList = links.map((link) =>
      plainToInstance(GetLinkByIdResponse, link, {
        excludeExtraneousValues: true,
      }),
    );

    return apiResponseSuccess(this.i18nService, new GetFavoriteLinksResponse({ linkList }));
  }
}
