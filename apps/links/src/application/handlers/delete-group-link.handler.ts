import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

import { DeleteGroupLinkCommand } from '@apps/links/src/application/commands';
import { GetGroupLinkByIdResponse } from '@apps/links/src/application/responses';
import { GroupLinksErrorMessageConstants } from '@apps/links/src/constants';
import { type IGroupLinkRepository, type ILinkRepository } from '@apps/links/src/domain/ports';


@CommandHandler(DeleteGroupLinkCommand)
export class DeleteGroupLinkHandler
  extends BaseHandler<DeleteGroupLinkCommand, ApiResponse<GetGroupLinkByIdResponse>>
  implements ICommandHandler<DeleteGroupLinkCommand, ApiResponse<GetGroupLinkByIdResponse>>
{
  constructor(
    @Inject('IGroupLinkRepository')
    private readonly groupLinkRepository: IGroupLinkRepository,
    @Inject('ILinkRepository')
    private readonly linkRepository: ILinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: DeleteGroupLinkCommand): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    const groupLinkId = command.id ?? 0;
    if (!groupLinkId || groupLinkId <= 0) {
      return this.createResponseFailure(GroupLinksErrorMessageConstants.invalidGroupLinkId, HttpStatus.BAD_REQUEST);
    }

    const groupLink = await this.groupLinkRepository.findOne({
      where: { id: groupLinkId, userId: command.userId },
    });

    if (!groupLink) {
      return this.createResponseFailure(GroupLinksErrorMessageConstants.notFound, HttpStatus.NOT_FOUND);
    }

    // Manually nullify groupLinkId for all associated links
    // This is necessary because softDelete doesn't trigger ON DELETE SET NULL database constraints
    await this.linkRepository.update({ groupLinkId: groupLinkId, userId: command.userId }, { groupLinkId: null });

    const deleteResult = await this.groupLinkRepository.softDelete({ id: groupLinkId, userId: command.userId });
    if (!deleteResult.affected) {
      return this.createResponseFailure(GroupLinksErrorMessageConstants.notFound, HttpStatus.NOT_FOUND);
    }

    const response = plainToInstance(GetGroupLinkByIdResponse, groupLink, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }
}
