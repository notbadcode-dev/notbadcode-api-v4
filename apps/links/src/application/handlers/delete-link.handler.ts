import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

import { DeleteLinkCommand } from '@apps/links/src/application/commands/delete-link.command';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';
import { type ILinkRepository } from '@apps/links/src/domain/ports/link-repository.port';
import { LinkByIdSpecification } from '@apps/links/src/domain/specifications/link-by-id.specification';

import { LinksErrorMessageConstants } from '../../constants/links-error-message.constants';

@CommandHandler(DeleteLinkCommand)
export class DeleteLinkHandler
  extends BaseHandler<DeleteLinkCommand, ApiResponse<GetLinkByIdResponse>>
  implements ICommandHandler<DeleteLinkCommand, ApiResponse<GetLinkByIdResponse>>
{
  constructor(
    @Inject('ILinkRepository')
    private readonly linkRepository: ILinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: DeleteLinkCommand): Promise<ApiResponse<GetLinkByIdResponse>> {
    const linkId = command.id ?? 0;
    if (!linkId || linkId <= 0) {
      return this.createResponseFailure(LinksErrorMessageConstants.invalidLinkId);
    }

    const link = await this.linkRepository.findOne(LinkByIdSpecification.options(linkId, command.userId));

    if (!link) {
      return this.createResponseFailure(LinksErrorMessageConstants.notFound);
    }

    await this.linkRepository.softDelete({ id: linkId, userId: command.userId });

    const response = plainToInstance(GetLinkByIdResponse, link, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }
}
