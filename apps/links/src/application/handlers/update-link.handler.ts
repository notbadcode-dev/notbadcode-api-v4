import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { LengthSizes } from '@common/constants';
import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';
import { ErrorOn, ErrorOnFactory } from '@common/types';

import { UpdateLinkCommand } from '@apps/links/src/application/commands/update-link.command';
import { UpdateLinkRequest } from '@apps/links/src/application/requests/update-link.request';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';
import { LinkService } from '@apps/links/src/application/services/link.service';
import { type ILinkRepository } from '@apps/links/src/domain/ports/link-repository.port';
import { LinkByIdSpecification } from '@apps/links/src/domain/specifications/link-by-id.specification';

import { LinksErrorMessageConstants } from '../../constants/links-error-message.constants';

@CommandHandler(UpdateLinkCommand)
export class UpdateLinkHandler
  extends BaseHandler<UpdateLinkCommand, ApiResponse<GetLinkByIdResponse>>
  implements ICommandHandler<UpdateLinkCommand, ApiResponse<GetLinkByIdResponse>>
{
  constructor(
    @Inject('ILinkRepository')
    private readonly linkRepository: ILinkRepository,
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

    this.linkService.updateLink(link, sanitizedPayload);
    const updated = await this.linkRepository.save(link);

    const response = plainToInstance(GetLinkByIdResponse, updated, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }

  private validatePayload(payload: UpdateLinkRequest | undefined): ErrorOn<UpdateLinkRequest> {
    if (!payload) {
      return ErrorOnFactory.error(LinksErrorMessageConstants.invalidPayload);
    }

    if (typeof payload.url !== 'string') {
      return ErrorOnFactory.error(LinksErrorMessageConstants.invalidUrl);
    }

    const url = payload.url.trim();
    if (!url || !this.isValidUrl(url) || url.length > LengthSizes.extraLarge) {
      return ErrorOnFactory.error(LinksErrorMessageConstants.invalidUrl);
    }

    if (typeof payload.title !== 'string') {
      return ErrorOnFactory.error(LinksErrorMessageConstants.invalidTitle);
    }

    const title = payload.title.trim();
    if (!title || title.length > LengthSizes.regular) {
      return ErrorOnFactory.error(LinksErrorMessageConstants.invalidTitle);
    }

    if (typeof payload.description !== 'string') {
      return ErrorOnFactory.error(LinksErrorMessageConstants.descriptionRequired);
    }

    const description = payload.description.trim();
    if (!description || description.length > LengthSizes.medium) {
      return ErrorOnFactory.error(LinksErrorMessageConstants.descriptionRequired);
    }

    if (typeof payload.isFavorite !== 'boolean') {
      return ErrorOnFactory.error(LinksErrorMessageConstants.invalidFavoriteFlag);
    }

    const tagValidation = this.validateTags(payload.tagList);
    if (tagValidation.isError) {
      return ErrorOnFactory.error(LinksErrorMessageConstants.invalidTagList);
    }

    return ErrorOnFactory.success({
      url,
      title,
      description,
      isFavorite: payload.isFavorite,
      tagList: tagValidation.value,
    });
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
