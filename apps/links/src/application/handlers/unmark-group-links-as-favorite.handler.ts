import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { I18nService } from '@common/i18n';
import { ApiResponse, SuccessFailureResponse } from '@common/responses';

import { UnmarkGroupLinksAsFavoriteCommand } from '@apps/links/src/application/commands';
import { BaseMarkAsFavoriteHandler } from '@apps/links/src/application/handlers/base-mark-as-favorite.handler';
import { GROUP_LINK_REPOSITORY_TOKEN, type IGroupLinkRepository } from '@apps/links/src/domain/ports';

@CommandHandler(UnmarkGroupLinksAsFavoriteCommand)
export class UnmarkGroupLinksAsFavoriteHandler
  extends BaseMarkAsFavoriteHandler<UnmarkGroupLinksAsFavoriteCommand, { id: number; userId: number; isFavorite: boolean }>
  implements ICommandHandler<UnmarkGroupLinksAsFavoriteCommand>
{
  constructor(
    @Inject(GROUP_LINK_REPOSITORY_TOKEN)
    private readonly groupLinkRepository: IGroupLinkRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: UnmarkGroupLinksAsFavoriteCommand): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    return this.markEntitiesAsFavorite(this.groupLinkRepository, command.request.groupLinkIdList, command.userId, false);
  }
}
