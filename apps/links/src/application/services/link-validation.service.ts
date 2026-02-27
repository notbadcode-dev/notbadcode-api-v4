import { Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { LengthSizes } from '@common/constants';
import { ErrorOn, ErrorOnFactory } from '@common/types';

import { CreateLinkRequest } from '@apps/links/src/application/requests';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';

const MYSQL_DUPLICATE_ENTRY_ERRNO = 1062;

@Injectable()
export class LinkValidationService {
  validateCreatePayload(payload: CreateLinkRequest | undefined): ErrorOn<CreateLinkRequest> {
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

    const fieldsResult = this.validateCommonFields(payload, result);
    if (fieldsResult.isError) return fieldsResult as ErrorOn<CreateLinkRequest>;

    return ErrorOnFactory.success(fieldsResult.value as CreateLinkRequest);
  }

  validateUpdatePayload(payload: Partial<CreateLinkRequest> | undefined): ErrorOn<Partial<CreateLinkRequest>> {
    if (!payload) {
      return ErrorOnFactory.error(LinksErrorMessageConstants.invalidPayload);
    }

    const result: Partial<CreateLinkRequest> = {};

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

    const fieldsResult = this.validateCommonFields(payload, result);
    if (fieldsResult.isError) return fieldsResult;

    if (Object.keys(fieldsResult.value).length === 0) {
      return ErrorOnFactory.error(LinksErrorMessageConstants.invalidPayload);
    }

    return ErrorOnFactory.success(fieldsResult.value);
  }

  isDuplicateEntryError(error: unknown): boolean {
    if (error instanceof QueryFailedError) {
      const dbError = error as QueryFailedError & { code?: string; errno?: number };
      return dbError.code === 'ER_DUP_ENTRY' || dbError.errno === MYSQL_DUPLICATE_ENTRY_ERRNO;
    }
    return false;
  }

  isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  private validateCommonFields(payload: Partial<CreateLinkRequest>, result: Partial<CreateLinkRequest>): ErrorOn<Partial<CreateLinkRequest>> {
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
}
