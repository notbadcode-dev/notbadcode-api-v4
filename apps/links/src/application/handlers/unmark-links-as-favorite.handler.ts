import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { In } from 'typeorm';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse, SuccessFailureResponse } from '@common/responses';

import { UnmarkLinksAsFavoriteCommand } from '@apps/links/src/application/commands';
import { type ILinkRepository } from '@apps/links/src/domain/ports';

@CommandHandler(UnmarkLinksAsFavoriteCommand)
export class UnmarkLinksAsFavoriteHandler
  extends BaseHandler<UnmarkLinksAsFavoriteCommand, ApiResponse<SuccessFailureResponse<number>>>
  implements ICommandHandler<UnmarkLinksAsFavoriteCommand>
{
  constructor(
    @Inject('ILinkRepository')
    private readonly linkRepository: ILinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: UnmarkLinksAsFavoriteCommand): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    const { linkIdList } = command.request;
    const userId = command.userId;

    const result: SuccessFailureResponse<number> = {
      successList: [],
      failureList: [],
    };

    if (!linkIdList.length) {
      return this.createSuccessResponse(result);
    }

    const existingLinks = await this.linkRepository.find({
      select: ['id'],
      where: { id: In(linkIdList), userId },
    });

    const existingIds = existingLinks.map((l) => l.id);

    const notFoundIds = linkIdList.filter((id) => !existingIds.includes(id));
    result.failureList.push(...notFoundIds);

    if (!existingIds.length) {
      return this.createSuccessResponse(result);
    }

    const updateResult = await this.linkRepository.update({ id: In(existingIds), userId }, { isFavorite: false });

    const affected = updateResult.affected ?? 0;

    if (affected === existingIds.length) {
      result.successList.push(...existingIds);
      return this.createSuccessResponse(result);
    }

    result.successList.push(...existingIds.slice(0, affected));
    result.failureList.push(...existingIds.slice(affected));

    return this.createSuccessResponse(result);
  }
}
