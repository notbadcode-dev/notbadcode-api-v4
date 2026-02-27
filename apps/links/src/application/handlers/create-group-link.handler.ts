import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { LengthSizes } from '@common/constants';
import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';
import { ErrorOn, ErrorOnFactory } from '@common/types';

import { CreateGroupLinkCommand } from '@apps/links/src/application/commands';
import { CreateGroupLinkRequest } from '@apps/links/src/application/requests';
import { GetGroupLinkByIdResponse } from '@apps/links/src/application/responses';
import { GroupLinksErrorMessageConstants } from '@apps/links/src/constants';
import { GroupLink } from '@apps/links/src/domain/entities';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports';
import { LINK_REPOSITORY_TOKEN, GROUP_LINK_REPOSITORY_TOKEN } from '@apps/links/src/domain/ports';


@CommandHandler(CreateGroupLinkCommand)
export class CreateGroupLinkHandler
  extends BaseHandler<CreateGroupLinkCommand, ApiResponse<GetGroupLinkByIdResponse>>
  implements ICommandHandler<CreateGroupLinkCommand, ApiResponse<GetGroupLinkByIdResponse>>
{
  constructor(
    @Inject(GROUP_LINK_REPOSITORY_TOKEN)
    private readonly groupLinkRepository: IGroupLinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: CreateGroupLinkCommand): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    const validationResult = this.validatePayload(command.payload);
    if (validationResult.isError) {
      return this.createResponseFailure(validationResult.errorMessage, HttpStatus.BAD_REQUEST);
    }
    const sanitizedPayload = validationResult.value;

    if (sanitizedPayload.parentGroupLinkId !== undefined && sanitizedPayload.parentGroupLinkId !== null) {
      const parentGroupLink = await this.groupLinkRepository.findOne({
        where: { id: sanitizedPayload.parentGroupLinkId, userId: command.userId },
      });
      if (!parentGroupLink) {
        return this.createResponseFailure(GroupLinksErrorMessageConstants.parentGroupLinkNotFound, HttpStatus.NOT_FOUND);
      }
    }

    const groupLink = Object.assign(new GroupLink(), {
      userId: command.userId,
      title: sanitizedPayload.title,
      description: sanitizedPayload.description ?? null,
      color: sanitizedPayload.color ?? null,
      icon: sanitizedPayload.icon ?? null,
      parentGroupLinkId: sanitizedPayload.parentGroupLinkId ?? null,
      isFavorite: sanitizedPayload.isFavorite ?? false,
    });

    const saved = await this.groupLinkRepository.save(groupLink);

    const response = plainToInstance(GetGroupLinkByIdResponse, saved, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }

  private validatePayload(payload: CreateGroupLinkRequest | undefined): ErrorOn<CreateGroupLinkRequest> {
    if (!payload) {
      return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidPayload);
    }

    if (typeof payload.title !== 'string') {
      return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidTitle);
    }
    const title = payload.title.trim();
    if (!title || title.length > LengthSizes.regular) {
      return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidTitle);
    }

    const result: CreateGroupLinkRequest = { title };

    if (payload.description !== undefined) {
      if (typeof payload.description !== 'string') {
        return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidDescription);
      }
      const description = payload.description.trim();
      if (description.length > LengthSizes.medium) {
        return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidDescription);
      }
      if (description) {
        result.description = description;
      }
    }

    if (payload.color !== undefined) {
      if (!this.isValidRgbColor(payload.color)) {
        return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidColor);
      }
      result.color = payload.color;
    }

    if (payload.icon !== undefined) {
      if (typeof payload.icon !== 'string') {
        return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidIcon);
      }
      const icon = payload.icon.trim();
      if (icon.length > LengthSizes.regular) {
        return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidIcon);
      }
      if (icon) {
        result.icon = icon;
      }
    }

    if (payload.parentGroupLinkId !== undefined) {
      if (payload.parentGroupLinkId === null) {
        result.parentGroupLinkId = null;
      } else if (typeof payload.parentGroupLinkId !== 'number' || !Number.isInteger(payload.parentGroupLinkId) || payload.parentGroupLinkId <= 0) {
        return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidParentGroupLinkId);
      } else {
        result.parentGroupLinkId = payload.parentGroupLinkId;
      }
    }

    if (payload.isFavorite !== undefined) {
      if (typeof payload.isFavorite !== 'boolean') {
        return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidFavoriteFlag);
      }
      result.isFavorite = payload.isFavorite;
    }

    return ErrorOnFactory.success(result);
  }

  private isValidRgbColor(color: unknown): color is { r: number; g: number; b: number } {
    if (typeof color !== 'object' || color === null) {
      return false;
    }
    const c = color as { r?: unknown; g?: unknown; b?: unknown };
    return (
      typeof c.r === 'number' &&
      typeof c.g === 'number' &&
      typeof c.b === 'number' &&
      Number.isInteger(c.r) &&
      Number.isInteger(c.g) &&
      Number.isInteger(c.b) &&
      c.r >= 0 &&
      c.r <= 255 &&
      c.g >= 0 &&
      c.g <= 255 &&
      c.b >= 0 &&
      c.b <= 255
    );
  }
}
