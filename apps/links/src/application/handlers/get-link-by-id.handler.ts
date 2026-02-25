import { HttpStatus, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

import { GetLinkByIdQuery } from '@apps/links/src/application/queries';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
import { type ILinkRepository } from '@apps/links/src/domain/ports';
import { LinkByIdSpecification } from '@apps/links/src/domain/specifications';


@QueryHandler(GetLinkByIdQuery)
export class GetLinkByIdHandler
  extends BaseHandler<GetLinkByIdQuery, ApiResponse<GetLinkByIdResponse>>
  implements IQueryHandler<GetLinkByIdQuery, ApiResponse<GetLinkByIdResponse>>
{
  constructor(
    @Inject('ILinkRepository')
    private readonly linkRepository: ILinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(query: GetLinkByIdQuery): Promise<ApiResponse<GetLinkByIdResponse>> {
    const linkId = query.id ?? 0;
    if (!linkId || linkId <= 0) {
      return this.createResponseFailure(LinksErrorMessageConstants.invalidLinkId, HttpStatus.BAD_REQUEST);
    }

    const link = await this.linkRepository.findOne(LinkByIdSpecification.options(linkId, query.userId));

    if (!link) {
      return this.createResponseFailure(LinksErrorMessageConstants.notFound, HttpStatus.NOT_FOUND);
    }

    const response = plainToInstance(GetLinkByIdResponse, link, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }
}
