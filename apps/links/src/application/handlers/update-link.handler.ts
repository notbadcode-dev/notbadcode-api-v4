import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { LengthSizes } from '@common/constants';
import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';
import { ErrorOn, ErrorOnFactory } from '@common/types';

import { UpdateLinkCommand } from '@apps/links/src/application/commands';
import { UpdateLinkRequest } from '@apps/links/src/application/requests';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses';
import { LinkService } from '@apps/links/src/application/services';
import { type IGroupLinkRepository, type ILinkRepository } from '@apps/links/src/domain/ports';
import { LinkByIdSpecification } from '@apps/links/src/domain/specifications';

import { LinksErrorMessageConstants } from '@apps/links/src/constants';

@CommandHandler(UpdateLinkCommand)
export class UpdateLinkHandler
  extends BaseHandler<UpdateLinkCommand, ApiResponse<GetLinkByIdResponse>>
  implements ICommandHandler<UpdateLinkCommand, ApiResponse<GetLinkByIdResponse>>
{
  constructor(
    @Inject('ILinkRepository')
    private readonly linkRepository: ILinkRepository,
    @Inject('IGroupLinkRepository')
    private readonly groupLinkRepository: IGroupLinkRepository,
    private readonly linkService: LinkService,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: UpdateLinkCommand): Promise<ApiResponse<GetLinkByIdResponse>> {
    const linkId = command.id ?? 0;
    if (!linkId || linkId <= 0) {
      return this.createResponseFailure(LinksErrorMessageConstants.invalidLinkId);
    }

    const validationResult = this.validatePayload(command.payload);
    if (validationResult.isError) {
      return this.createResponseFailure(validationResult.errorMessage);
    }
    const sanitizedPayload = validationResult.value;

    const link = await this.linkRepository.findOne(LinkByIdSpecification.options(linkId, command.userId));

    if (!link) {
      return this.createResponseFailure(LinksErrorMessageConstants.notFound);
    }

    if (sanitizedPayload.groupLinkId !== undefined && sanitizedPayload.groupLinkId !== null) {
      const groupLink = await this.groupLinkRepository.findOne({ where: { id: sanitizedPayload.groupLinkId, userId: command.userId } });
      if (!groupLink) {
        return this.createResponseFailure(LinksErrorMessageConstants.groupLinkNotFound);
      }
    }

    this.linkService.updateLink(link, sanitizedPayload);
    const updated = await this.linkRepository.save(link);

    const response = plainToInstance(GetLinkByIdResponse, updated, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }

  private validatePayload(payload: UpdateLinkRequest | undefined): ErrorOn<Partial<UpdateLinkRequest>> {
    if (!payload) {
      return ErrorOnFactory.error(LinksErrorMessageConstants.invalidPayload);
    }

    const result: Partial<UpdateLinkRequest> = {};

    if (payload.url !== undefined) {
      if (typeof payload.url !== 'string') {
        return ErrorOnFactory.error(LinksErrorMessageConstants.invalidUrl);
      }
      const url = payload.url.trim();
      if (!url || !this.isValidUrl(url) || url.length > LengthSizes.extraLarge) {
        return ErrorOnFactory.error(LinksErrorMessageConstants.invalidUrl);
      }
      result.url = url;
    }

    if (payload.title !== undefined) {
      if (typeof payload.title !== 'string') {
        return ErrorOnFactory.error(LinksErrorMessageConstants.invalidTitle);
      }
      const title = payload.title.trim();
      if (!title || title.length > LengthSizes.regular) {
        return ErrorOnFactory.error(LinksErrorMessageConstants.invalidTitle);
      }
      result.title = title;
    }

    if (payload.description !== undefined) {
      if (typeof payload.description !== 'string') {
        return ErrorOnFactory.error(LinksErrorMessageConstants.descriptionRequired);
      }
      const description = payload.description.trim();
      if (!description || description.length > LengthSizes.medium) {
        return ErrorOnFactory.error(LinksErrorMessageConstants.descriptionRequired);
      }
      result.description = description;
    }

    if (payload.isFavorite !== undefined) {
      if (typeof payload.isFavorite !== 'boolean') {
        return ErrorOnFactory.error(LinksErrorMessageConstants.invalidFavoriteFlag);
      }
      result.isFavorite = payload.isFavorite;
    }

    if (payload.tagList !== undefined) {
      const tagValidation = this.validateTags(payload.tagList);
      if (tagValidation.isError) {
        return ErrorOnFactory.error(LinksErrorMessageConstants.invalidTagList);
      }
      result.tagList = tagValidation.value;
    }

    if (payload.groupLinkId !== undefined) {
      if (payload.groupLinkId === null) {
        result.groupLinkId = null;
      } else if (typeof payload.groupLinkId !== 'number' || !Number.isInteger(payload.groupLinkId) || payload.groupLinkId <= 0) {
        return ErrorOnFactory.error(LinksErrorMessageConstants.invalidGroupLinkId);
      } else {
        result.groupLinkId = payload.groupLinkId;
      }
    }

    if (Object.keys(result).length === 0) {
      return ErrorOnFactory.error(LinksErrorMessageConstants.invalidPayload);
    }

    return ErrorOnFactory.success(result);
  }

  private validateTags(tagList: unknown): ErrorOn<string[]> {
    if (!Array.isArray(tagList) || tagList.length > LengthSizes.small) {
      return ErrorOnFactory.error(LinksErrorMessageConstants.invalidTagList);
    }

    const sanitizedTags: string[] = [];
    for (const tag of tagList) {
      if (typeof tag !== 'string') {
        return ErrorOnFactory.error(LinksErrorMessageConstants.invalidTagList);
      }
      const trimmed = tag.trim();
      if (!trimmed || trimmed.length > LengthSizes.regular) {
        return ErrorOnFactory.error(LinksErrorMessageConstants.invalidTagList);
      }
      sanitizedTags.push(trimmed);
    }
    return ErrorOnFactory.success(sanitizedTags);
  }

  private isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
}
