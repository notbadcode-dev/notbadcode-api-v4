import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { QueryFailedError } from 'typeorm';

import { LengthSizes } from '@common/constants';
import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';
import { ErrorOn, ErrorOnFactory } from '@common/types';

import { CreateLinkCommand } from '@apps/links/src/application/commands';
import { CreateLinkRequest } from '@apps/links/src/application/requests';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
import { Link } from '@apps/links/src/domain/entities';
import { LinkLastStatusCode } from '@apps/links/src/domain/enums';
import { type IGroupLinkRepository, type ILinkRepository } from '@apps/links/src/domain/ports';


@CommandHandler(CreateLinkCommand)
export class CreateLinkHandler
  extends BaseHandler<CreateLinkCommand, ApiResponse<GetLinkByIdResponse>>
  implements ICommandHandler<CreateLinkCommand, ApiResponse<GetLinkByIdResponse>>
{
  constructor(
    @Inject('ILinkRepository')
    private readonly linkRepository: ILinkRepository,
    @Inject('IGroupLinkRepository')
    private readonly groupLinkRepository: IGroupLinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: CreateLinkCommand): Promise<ApiResponse<GetLinkByIdResponse>> {
    const validationResult = this.validatePayload(command.payload);
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

    const link = Object.assign(new Link(), {
      userId: command.userId,
      url: sanitizedPayload.url,
      normalizedUrl,
      title: sanitizedPayload.title ?? null,
      description: sanitizedPayload.description ?? null,
      faviconUrl: null,
      imagePreviewUrl: null,
      isFavorite: sanitizedPayload.isFavorite ?? false,
      tagList: sanitizedPayload.tagList ?? [],
      isActive: true,
      lastStatusCode: LinkLastStatusCode.PENDING,
      lastCheckedAt: null,
      lastVisitedAt: null,
      groupLinkId: sanitizedPayload.groupLinkId ?? null,
    });

    let saved: Link;
    try {
      saved = await this.linkRepository.save(link);
    } catch (error) {
      if (this.isDuplicateEntryError(error)) {
        return this.createResponseFailure(LinksErrorMessageConstants.duplicateUrl, HttpStatus.CONFLICT);
      }
      throw error;
    }

    const response = plainToInstance(GetLinkByIdResponse, saved, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }

  private validatePayload(payload: CreateLinkRequest | undefined): ErrorOn<CreateLinkRequest> {
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

    const result: CreateLinkRequest = { url };

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

  private isDuplicateEntryError(error: unknown): boolean {
    if (error instanceof QueryFailedError) {
      const dbError = error as QueryFailedError & { code?: string; errno?: number };
      return dbError.code === 'ER_DUP_ENTRY' || dbError.errno === 1062;
    }
    return false;
  }
}
