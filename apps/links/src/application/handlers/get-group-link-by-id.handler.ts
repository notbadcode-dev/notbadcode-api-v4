import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

import { GetGroupLinkByIdQuery } from '@apps/links/src/application/queries/get-group-link-by-id.query';
import { GetGroupLinkByIdResponse } from '@apps/links/src/application/responses/get-group-link-by-id.response';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports/group-link-repository.port';
import { GroupLinkByIdSpecification } from '@apps/links/src/domain/specifications/group-link-by-id.specification';

import { LinksErrorMessageConstants } from '../../constants/links-error-message.constants';

@QueryHandler(GetGroupLinkByIdQuery)
export class GetGroupLinkByIdHandler
  extends BaseHandler<GetGroupLinkByIdQuery, ApiResponse<GetGroupLinkByIdResponse>>
  implements IQueryHandler<GetGroupLinkByIdQuery, ApiResponse<GetGroupLinkByIdResponse>>
{
  constructor(
    @Inject('IGroupLinkRepository')
    private readonly groupLinkRepository: IGroupLinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(query: GetGroupLinkByIdQuery): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    const groupLinkId = query.id ?? 0;
    if (!groupLinkId || groupLinkId <= 0) {
      return this.createResponseFailure(LinksErrorMessageConstants.invalidGroupLinkId);
    }

    const groupLink = await this.groupLinkRepository.findOne(GroupLinkByIdSpecification.options(groupLinkId, query.userId));

    if (!groupLink) {
      return this.createResponseFailure(LinksErrorMessageConstants.groupLinkNotFound);
    }

    const response = plainToInstance(GetGroupLinkByIdResponse, groupLink, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }
}
