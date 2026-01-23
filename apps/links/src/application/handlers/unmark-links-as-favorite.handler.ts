import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse, SuccessFailureResponse } from '@common/responses';

import { UnmarkLinksAsFavoriteCommand } from '@apps/links/src/application/commands/unmark-links-as-favorite.command';
import { Link } from '@apps/links/src/domain/entities/link.entity';

@CommandHandler(UnmarkLinksAsFavoriteCommand)
export class UnmarkLinksAsFavoriteHandler
  extends BaseHandler<UnmarkLinksAsFavoriteCommand, ApiResponse<SuccessFailureResponse<number>>>
  implements ICommandHandler<UnmarkLinksAsFavoriteCommand>
{
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: UnmarkLinksAsFavoriteCommand): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    const { linkIdList } = command.request;

    const result: SuccessFailureResponse<number> = {
      successList: [],
      failureList: [],
    };

    if (!linkIdList.length) {
      return this.createSuccessResponse(result);
    }

    const existingLinks = await this.linkRepository.find({
      select: ['id'],
      where: { id: In(linkIdList) },
    });

    const existingIds = existingLinks.map((l) => l.id);

    const notFoundIds = linkIdList.filter((id) => !existingIds.includes(id));
    result.failureList.push(...notFoundIds);

    if (!existingIds.length) {
      return this.createSuccessResponse(result);
    }

    const updateResult = await this.linkRepository.update({ id: In(existingIds) }, { isFavorite: false });

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
