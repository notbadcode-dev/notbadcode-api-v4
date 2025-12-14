import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { BasePaginatedHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse, PaginatedResponse } from '@common/responses';

import { GetLinksPaginatedCommand } from '@apps/links/src/application/commands/get-links-paginated.command';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';
import { LinksErrorMessageConstants } from '@apps/links/src/constants/links-error-message.constants';
import { Link } from '@apps/links/src/domain/entities/link.entity';

@CommandHandler(GetLinksPaginatedCommand)
export class GetLinksPaginatedHandler
  extends BasePaginatedHandler<GetLinksPaginatedCommand, Link, GetLinkByIdResponse>
  implements ICommandHandler<GetLinksPaginatedCommand, ApiResponse<PaginatedResponse<GetLinkByIdResponse>>>
{
  constructor(
    @InjectRepository(Link)
    private readonly repository: Repository<Link>,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: GetLinksPaginatedCommand): Promise<ApiResponse<PaginatedResponse<GetLinkByIdResponse>>> {
    const map = (link: Link): GetLinkByIdResponse =>
      plainToInstance(GetLinkByIdResponse, link, {
        excludeExtraneousValues: true,
      });

    return this.executePaginated(this.repository, command.request, map, LinksErrorMessageConstants.notFound);
  }
}
