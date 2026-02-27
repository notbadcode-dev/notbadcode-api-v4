import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { I18nService } from '@common/i18n';
import { ApiResponse, SuccessFailureResponse } from '@common/responses';

import { MarkGroupLinksAsFavoriteCommand } from '@apps/links/src/application/commands';
import { BaseMarkAsFavoriteHandler } from '@apps/links/src/application/handlers/base-mark-as-favorite.handler';
import { GROUP_LINK_REPOSITORY_TOKEN, type IGroupLinkRepository } from '@apps/links/src/domain/ports';

@CommandHandler(MarkGroupLinksAsFavoriteCommand)
export class MarkGroupLinksAsFavoriteHandler extends BaseMarkAsFavoriteHandler<MarkGroupLinksAsFavoriteCommand, { id: number; userId: number; isFavorite: boolean }> implements ICommandHandler<MarkGroupLinksAsFavoriteCommand> {
  constructor(
    @Inject(GROUP_LINK_REPOSITORY_TOKEN)
    private readonly groupLinkRepository: IGroupLinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: MarkGroupLinksAsFavoriteCommand): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    return this.markEntitiesAsFavorite(this.groupLinkRepository, command.request.groupLinkIdList, command.userId, true);
  }
}
