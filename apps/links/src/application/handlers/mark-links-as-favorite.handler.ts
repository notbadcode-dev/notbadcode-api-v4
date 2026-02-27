import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { I18nService } from '@common/i18n';
import { ApiResponse, SuccessFailureResponse } from '@common/responses';

import { MarkLinksAsFavoriteCommand } from '@apps/links/src/application/commands';
import { BaseMarkAsFavoriteHandler } from '@apps/links/src/application/handlers/base-mark-as-favorite.handler';
import { LINK_REPOSITORY_TOKEN, type ILinkRepository } from '@apps/links/src/domain/ports';

@CommandHandler(MarkLinksAsFavoriteCommand)
export class MarkLinksAsFavoriteHandler extends BaseMarkAsFavoriteHandler<MarkLinksAsFavoriteCommand, { id: number; userId: number; isFavorite: boolean }> implements ICommandHandler<MarkLinksAsFavoriteCommand> {
  constructor(
    @Inject(LINK_REPOSITORY_TOKEN)
    private readonly linkRepository: ILinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: MarkLinksAsFavoriteCommand): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    return this.markEntitiesAsFavorite(this.linkRepository, command.request.linkIdList, command.userId, true);
  }
}
