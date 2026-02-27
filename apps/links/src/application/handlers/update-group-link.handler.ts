import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { LengthSizes } from '@common/constants';
import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';
import { ErrorOn, ErrorOnFactory } from '@common/types';

import { UpdateGroupLinkCommand } from '@apps/links/src/application/commands';
import { UpdateGroupLinkRequest } from '@apps/links/src/application/requests';
import { GetGroupLinkByIdResponse } from '@apps/links/src/application/responses';
import { GroupLinksErrorMessageConstants } from '@apps/links/src/constants';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports';
import { LINK_REPOSITORY_TOKEN, GROUP_LINK_REPOSITORY_TOKEN } from '@apps/links/src/domain/ports';


@CommandHandler(UpdateGroupLinkCommand)
export class UpdateGroupLinkHandler
  extends BaseHandler<UpdateGroupLinkCommand, ApiResponse<GetGroupLinkByIdResponse>>
  implements ICommandHandler<UpdateGroupLinkCommand, ApiResponse<GetGroupLinkByIdResponse>>
{
  constructor(
    @Inject(GROUP_LINK_REPOSITORY_TOKEN)
    private readonly groupLinkRepository: IGroupLinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: UpdateGroupLinkCommand): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    const groupLinkId = command.id ?? 0;
    if (!groupLinkId || groupLinkId <= 0) {
      return this.createResponseFailure(GroupLinksErrorMessageConstants.invalidGroupLinkId, HttpStatus.BAD_REQUEST);
    }

    const validationResult = this.validatePayload(command.payload);
    if (validationResult.isError) {
      return this.createResponseFailure(validationResult.errorMessage, HttpStatus.BAD_REQUEST);
    }
    const sanitizedPayload = validationResult.value;

    const groupLink = await this.groupLinkRepository.findOne({
      where: { id: groupLinkId, userId: command.userId },
    });

    if (!groupLink) {
      return this.createResponseFailure(GroupLinksErrorMessageConstants.notFound, HttpStatus.NOT_FOUND);
    }

    if (sanitizedPayload.parentGroupLinkId !== undefined && sanitizedPayload.parentGroupLinkId !== null) {
      if (sanitizedPayload.parentGroupLinkId === groupLinkId) {
        return this.createResponseFailure(GroupLinksErrorMessageConstants.invalidParentGroupLinkId, HttpStatus.BAD_REQUEST);
      }
      const parentGroupLink = await this.groupLinkRepository.findOne({
        where: { id: sanitizedPayload.parentGroupLinkId, userId: command.userId },
      });
      if (!parentGroupLink) {
        return this.createResponseFailure(GroupLinksErrorMessageConstants.parentGroupLinkNotFound, HttpStatus.NOT_FOUND);
      }

      const hasCycle = await this.hasParentCycle(command.userId, groupLinkId, parentGroupLink.id);
      if (hasCycle) {
        return this.createResponseFailure(GroupLinksErrorMessageConstants.invalidParentGroupLinkId, HttpStatus.CONFLICT);
      }
    }

    if (sanitizedPayload.title !== undefined) {
      groupLink.title = sanitizedPayload.title;
    }
    if (sanitizedPayload.description !== undefined) {
      groupLink.description = sanitizedPayload.description;
    }
    if (sanitizedPayload.color !== undefined) {
      groupLink.color = sanitizedPayload.color;
    }
    if (sanitizedPayload.icon !== undefined) {
      groupLink.icon = sanitizedPayload.icon;
    }
    if (sanitizedPayload.parentGroupLinkId !== undefined) {
      groupLink.parentGroupLinkId = sanitizedPayload.parentGroupLinkId;
    }
    if (sanitizedPayload.isFavorite !== undefined) {
      groupLink.isFavorite = sanitizedPayload.isFavorite;
    }

    const updated = await this.groupLinkRepository.save(groupLink);

    const response = plainToInstance(GetGroupLinkByIdResponse, updated, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }

  private validatePayload(payload: UpdateGroupLinkRequest | undefined): ErrorOn<Partial<UpdateGroupLinkRequest>> {
    if (!payload) {
      return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidPayload);
    }

    const result: Partial<UpdateGroupLinkRequest> = {};

    if (payload.title !== undefined) {
      if (typeof payload.title !== 'string') {
        return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidTitle);
      }
      const title = payload.title.trim();
      if (!title || title.length > LengthSizes.regular) {
        return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidTitle);
      }
      result.title = title;
    }

    if (payload.description !== undefined) {
      if (payload.description === null) {
        result.description = null;
      } else if (typeof payload.description !== 'string') {
        return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidDescription);
      } else {
        const description = payload.description.trim();
        if (description.length > LengthSizes.medium) {
          return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidDescription);
        }
        result.description = description || null;
      }
    }

    if (payload.color !== undefined) {
      if (payload.color === null) {
        result.color = null;
      } else if (!this.isValidRgbColor(payload.color)) {
        return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidColor);
      } else {
        result.color = payload.color;
      }
    }

    if (payload.icon !== undefined) {
      if (payload.icon === null) {
        result.icon = null;
      } else if (typeof payload.icon !== 'string') {
        return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidIcon);
      } else {
        const icon = payload.icon.trim();
        if (icon.length > LengthSizes.regular) {
          return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidIcon);
        }
        result.icon = icon || null;
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

    if (Object.keys(result).length === 0) {
      return ErrorOnFactory.error(GroupLinksErrorMessageConstants.invalidPayload);
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

  private async hasParentCycle(userId: number, targetGroupLinkId: number, initialParentGroupLinkId: number | null): Promise<boolean> {
    const visited = new Set<number>();
    let currentParentId = initialParentGroupLinkId;

    while (currentParentId !== null) {
      if (currentParentId === targetGroupLinkId) {
        return true;
      }
      if (visited.has(currentParentId)) {
        return true;
      }
      visited.add(currentParentId);

      const parent = await this.groupLinkRepository.findOne({
        where: { id: currentParentId, userId },
      });

      if (!parent) {
        return false;
      }

      currentParentId = parent.parentGroupLinkId ?? null;
    }

    return false;
  }
}
