import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

import { GetLinkByIdCommand } from '@apps/links/src/application/commands/get-link-by-id.command';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';
import { Link } from '@apps/links/src/domain/entities/link.entity';
import { LinkByIdSpecification } from '@apps/links/src/domain/specifications/link-by-id.specification';

import { LinksErrorMessageConstants } from '../../constants/links-error-message.constants';

@CommandHandler(GetLinkByIdCommand)
export class GetLinkByIdHandler
  extends BaseHandler<GetLinkByIdCommand, ApiResponse<GetLinkByIdResponse>>
  implements ICommandHandler<GetLinkByIdCommand, ApiResponse<GetLinkByIdResponse>>
{
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: GetLinkByIdCommand): Promise<ApiResponse<GetLinkByIdResponse>> {
    const linkId = command.id ?? 0;
    if (!linkId || linkId <= 0) {
      return this.createResponseFailure(LinksErrorMessageConstants.invalidLinkId);
    }

    const link = await this.linkRepository.findOne(LinkByIdSpecification.options(linkId));

    if (!link) {
      return this.createResponseFailure(LinksErrorMessageConstants.notFound);
    }

    const response = plainToInstance(GetLinkByIdResponse, link, { excludeExtraneousValues: true });
    return this.createSuccessResponse(response);
  }
}
