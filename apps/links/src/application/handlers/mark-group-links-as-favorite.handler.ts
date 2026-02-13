import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { In } from 'typeorm';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse, SuccessFailureResponse } from '@common/responses';

import { MarkGroupLinksAsFavoriteCommand } from '@apps/links/src/application/commands';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports';

@CommandHandler(MarkGroupLinksAsFavoriteCommand)
export class MarkGroupLinksAsFavoriteHandler
  extends BaseHandler<MarkGroupLinksAsFavoriteCommand, ApiResponse<SuccessFailureResponse<number>>>
  implements ICommandHandler<MarkGroupLinksAsFavoriteCommand>
{
  constructor(
    @Inject('IGroupLinkRepository')
    private readonly groupLinkRepository: IGroupLinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: MarkGroupLinksAsFavoriteCommand): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    const { groupLinkIdList } = command.request;
    const userId = command.userId;

    const result: SuccessFailureResponse<number> = {
      successList: [],
      failureList: [],
    };

    if (!groupLinkIdList.length) {
      return this.createSuccessResponse(result);
    }

    const existingGroupLinks = await this.groupLinkRepository.find({
      select: ['id'],
      where: { id: In(groupLinkIdList), userId },
    });

    const existingIds = existingGroupLinks.map((g) => g.id);

    const notFoundIds = groupLinkIdList.filter((id) => !existingIds.includes(id));
    result.failureList.push(...notFoundIds);

    if (!existingIds.length) {
      return this.createSuccessResponse(result);
    }

    const updateResult = await this.groupLinkRepository.update({ id: In(existingIds), userId }, { isFavorite: true });

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
