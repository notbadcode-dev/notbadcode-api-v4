import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

import { CreateLinkCommand } from '@apps/links/src/application/commands';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses';
import { LinkValidationService } from '@apps/links/src/application/services/link-validation.service';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
import { Link } from '@apps/links/src/domain/entities';
import { GROUP_LINK_REPOSITORY_TOKEN, LINK_REPOSITORY_TOKEN, type IGroupLinkRepository, type ILinkRepository } from '@apps/links/src/domain/ports';

@CommandHandler(CreateLinkCommand)
export class CreateLinkHandler
  extends BaseHandler<CreateLinkCommand, ApiResponse<GetLinkByIdResponse>>
  implements ICommandHandler<CreateLinkCommand, ApiResponse<GetLinkByIdResponse>>
{
  constructor(
    @Inject(LINK_REPOSITORY_TOKEN)
    private readonly linkRepository: ILinkRepository,
    @Inject(GROUP_LINK_REPOSITORY_TOKEN)
    private readonly groupLinkRepository: IGroupLinkRepository,
    private readonly linkValidationService: LinkValidationService,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: CreateLinkCommand): Promise<ApiResponse<GetLinkByIdResponse>> {
    const validationResult = this.linkValidationService.validateCreatePayload(command.payload);
    if (validationResult.isError) {
      return this.createResponseFailure(validationResult.errorMessage, HttpStatus.BAD_REQUEST);
    }
    const sanitizedPayload = validationResult.value;

    if (sanitizedPayload.groupLinkId !== undefined && sanitizedPayload.groupLinkId !== null) {
      const groupLink = await this.groupLinkRepository.findOne({ where: { id: sanitizedPayload.groupLinkId, userId: command.userId } });
      if (!groupLink) {
        return this.createResponseFailure(LinksErrorMessageConstants.groupLinkNotFound, HttpStatus.NOT_FOUND);
      }
    }

    const normalizedUrl = sanitizedPayload.url.toLowerCase();

    const existingLink = await this.linkRepository.findOne({ where: { userId: command.userId, normalizedUrl } });
    if (existingLink) {
      return this.createResponseFailure(LinksErrorMessageConstants.duplicateUrl, HttpStatus.CONFLICT);
    }

    const link = Link.build({
      userId: command.userId,
      url: sanitizedPayload.url,
      normalizedUrl,
      title: sanitizedPayload.title ?? null,
      description: sanitizedPayload.description ?? null,
      isFavorite: sanitizedPayload.isFavorite ?? false,
      tagList: sanitizedPayload.tagList ?? [],
      groupLinkId: sanitizedPayload.groupLinkId ?? null,
    });

    let saved: Link;
    try {
      saved = await this.linkRepository.save(link);
    } catch (error) {
      if (this.linkValidationService.isDuplicateEntryError(error)) {
        return this.createResponseFailure(LinksErrorMessageConstants.duplicateUrl, HttpStatus.CONFLICT);
      }
      throw error;
    }

    const response = plainToInstance(GetLinkByIdResponse, saved, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }
}
