import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

import { UpdateLinkCommand } from '@apps/links/src/application/commands';
import { UpdateLinkRequest } from '@apps/links/src/application/requests';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses';
import { LinkService } from '@apps/links/src/application/services';
import { LinkValidationService } from '@apps/links/src/application/services/link-validation.service';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
import { GROUP_LINK_REPOSITORY_TOKEN, LINK_REPOSITORY_TOKEN, type IGroupLinkRepository, type ILinkRepository } from '@apps/links/src/domain/ports';
import { LinkByIdSpecification } from '@apps/links/src/domain/specifications';

@CommandHandler(UpdateLinkCommand)
export class UpdateLinkHandler
  extends BaseHandler<UpdateLinkCommand, ApiResponse<GetLinkByIdResponse>>
  implements ICommandHandler<UpdateLinkCommand, ApiResponse<GetLinkByIdResponse>>
{
  constructor(
    @Inject(LINK_REPOSITORY_TOKEN)
    private readonly linkRepository: ILinkRepository,
    @Inject(GROUP_LINK_REPOSITORY_TOKEN)
    private readonly groupLinkRepository: IGroupLinkRepository,
    private readonly linkService: LinkService,
    private readonly linkValidationService: LinkValidationService,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: UpdateLinkCommand): Promise<ApiResponse<GetLinkByIdResponse>> {
    const linkId = command.id ?? 0;
    if (!linkId || linkId <= 0) {
      return this.createResponseFailure(LinksErrorMessageConstants.invalidLinkId, HttpStatus.BAD_REQUEST);
    }

    const validationResult = this.linkValidationService.validateUpdatePayload(command.payload as Partial<UpdateLinkRequest>);
    if (validationResult.isError) {
      return this.createResponseFailure(validationResult.errorMessage, HttpStatus.BAD_REQUEST);
    }
    const sanitizedPayload = validationResult.value;

    const link = await this.linkRepository.findOne(LinkByIdSpecification.options(linkId, command.userId));

    if (!link) {
      return this.createResponseFailure(LinksErrorMessageConstants.notFound, HttpStatus.NOT_FOUND);
    }

    if (sanitizedPayload.groupLinkId !== undefined && sanitizedPayload.groupLinkId !== null) {
      const groupLink = await this.groupLinkRepository.findOne({ where: { id: sanitizedPayload.groupLinkId, userId: command.userId } });
      if (!groupLink) {
        return this.createResponseFailure(LinksErrorMessageConstants.groupLinkNotFound, HttpStatus.NOT_FOUND);
      }
    }

    this.linkService.updateLink(link, sanitizedPayload);

    let updated = link;
    try {
      updated = await this.linkRepository.save(link);
    } catch (error) {
      if (this.linkValidationService.isDuplicateEntryError(error)) {
        return this.createResponseFailure(LinksErrorMessageConstants.duplicateUrl, HttpStatus.CONFLICT);
      }
      throw error;
    }

    const response = plainToInstance(GetLinkByIdResponse, updated, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }
}
