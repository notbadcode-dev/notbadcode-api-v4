import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse } from '@nestjs/swagger';

import { UserPaginatedRequest } from '@common/requests';
import { createPaginatedResponse } from '@common/responses';

import { GetLinkByIdCommand } from '@apps/links/src/application/commands/get-link-by-id.command';
import { GetLinksPaginatedCommand } from '@apps/links/src/application/commands/get-links-paginated.command';
import { UpdateLinkCommand } from '@apps/links/src/application/commands/update-link.command';
import { UpdateLinkRequest } from '@apps/links/src/application/requests/update-link.request';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';

@Controller('links')
export class LinksController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get(':id')
  @ApiOkResponse({ type: GetLinkByIdResponse })
  async getLinkById(@Param('id', ParseIntPipe) id: number): Promise<GetLinkByIdResponse> {
    return this.commandBus.execute(new GetLinkByIdCommand(id));
  }

  @Post('paginated')
  @ApiOkResponse({ type: createPaginatedResponse(GetLinkByIdResponse) })
  async getLinksPaginated(@Body() request: UserPaginatedRequest): Promise<InstanceType<ReturnType<typeof createPaginatedResponse>>> {
    return this.commandBus.execute(new GetLinksPaginatedCommand(request));
  }

  @Patch(':id')
  @ApiOkResponse({ type: GetLinkByIdResponse })
  async updateLink(@Param('id', ParseIntPipe) id: number, @Body() request: UpdateLinkRequest): Promise<GetLinkByIdResponse> {
    return this.commandBus.execute(new UpdateLinkCommand(id, request));
  }
}
