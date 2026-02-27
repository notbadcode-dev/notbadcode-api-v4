import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { I18nService } from '@common/i18n';
import { ApiResponse, SuccessFailureResponse } from '@common/responses';

import { UnmarkLinksAsFavoriteCommand } from '@apps/links/src/application/commands';
import { BaseMarkAsFavoriteHandler } from '@apps/links/src/application/handlers/base-mark-as-favorite.handler';
import { LINK_REPOSITORY_TOKEN, type ILinkRepository } from '@apps/links/src/domain/ports';

@CommandHandler(UnmarkLinksAsFavoriteCommand)
export class UnmarkLinksAsFavoriteHandler extends BaseMarkAsFavoriteHandler<UnmarkLinksAsFavoriteCommand, { id: number; userId: number; isFavorite: boolean }> implements ICommandHandler<UnmarkLinksAsFavoriteCommand> {
  constructor(
    @Inject(LINK_REPOSITORY_TOKEN)
    private readonly linkRepository: ILinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: UnmarkLinksAsFavoriteCommand): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    return this.markEntitiesAsFavorite(this.linkRepository, command.request.linkIdList, command.userId, false);
  }
}
