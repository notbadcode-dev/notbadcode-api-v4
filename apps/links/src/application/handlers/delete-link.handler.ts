import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

import { DeleteLinkCommand } from '@apps/links/src/application/commands';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
import { type ILinkRepository } from '@apps/links/src/domain/ports';
import { LINK_REPOSITORY_TOKEN, GROUP_LINK_REPOSITORY_TOKEN } from '@apps/links/src/domain/ports';
import { LinkByIdSpecification } from '@apps/links/src/domain/specifications';


@CommandHandler(DeleteLinkCommand)
export class DeleteLinkHandler
  extends BaseHandler<DeleteLinkCommand, ApiResponse<GetLinkByIdResponse>>
  implements ICommandHandler<DeleteLinkCommand, ApiResponse<GetLinkByIdResponse>>
{
  constructor(
    @Inject(LINK_REPOSITORY_TOKEN)
    private readonly linkRepository: ILinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: DeleteLinkCommand): Promise<ApiResponse<GetLinkByIdResponse>> {
    const linkId = command.id ?? 0;
    if (!linkId || linkId <= 0) {
      return this.createResponseFailure(LinksErrorMessageConstants.invalidLinkId, HttpStatus.BAD_REQUEST);
    }

    const link = await this.linkRepository.findOne(LinkByIdSpecification.options(linkId, command.userId));

    if (!link) {
      return this.createResponseFailure(LinksErrorMessageConstants.notFound, HttpStatus.NOT_FOUND);
    }

    const deleteResult = await this.linkRepository.softDelete({ id: linkId, userId: command.userId });
    if (!deleteResult.affected) {
      return this.createResponseFailure(LinksErrorMessageConstants.notFound, HttpStatus.NOT_FOUND);
    }

    const response = plainToInstance(GetLinkByIdResponse, link, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }
}
