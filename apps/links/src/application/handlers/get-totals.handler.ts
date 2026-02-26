import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { I18nService } from '@common/i18n';
import { apiResponseSuccess, type ApiResponse } from '@common/responses';

import { GetTotalsQuery } from '@apps/links/src/application/queries/get-totals.query';
import { GetTotalsResponse } from '@apps/links/src/application/responses/get-totals.response';
import { type IGroupLinkRepository, type ILinkRepository } from '@apps/links/src/domain/ports';

@QueryHandler(GetTotalsQuery)
export class GetTotalsHandler implements IQueryHandler<GetTotalsQuery, ApiResponse<GetTotalsResponse>> {
  constructor(
    @Inject('ILinkRepository')
    private readonly linkRepository: ILinkRepository,
    @Inject('IGroupLinkRepository')
    private readonly groupLinkRepository: IGroupLinkRepository,
    private readonly i18nService: I18nService,
  ) {}

  async execute(query: GetTotalsQuery): Promise<ApiResponse<GetTotalsResponse>> {
    const [_, totalLinks] = await this.linkRepository.findAndCount({
      where: { userId: query.userId },
      skip: 0,
      take: 0, // We only need the count
    });

    const [__, totalGroups] = await this.groupLinkRepository.findAndCount({
      where: { userId: query.userId },
      skip: 0,
      take: 0, // We only need the count
    });

    return apiResponseSuccess(
      this.i18nService,
      new GetTotalsResponse({
        totalLinks,
        totalGroups,
      }),
    );
  }
}
