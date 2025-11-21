import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse } from '@nestjs/swagger';

import { GetLinkByIdCommand } from '@apps/links/src/application/commands/get-link-by-id.command';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';

@Controller('links')
export class LinksController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get(':id')
  @ApiOkResponse({ type: GetLinkByIdResponse })
  async getLinkById(@Param('id', ParseIntPipe) id: number): Promise<GetLinkByIdResponse> {
    return this.commandBus.execute(new GetLinkByIdCommand(id));
  }
}
