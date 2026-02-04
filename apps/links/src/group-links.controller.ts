import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse } from '@nestjs/swagger';

import { CurrentUserId } from '@common/decorators';
import { JwtAuthGuard } from '@common/guards';
import { ApiResponse } from '@common/responses';

import { GetGroupLinkByIdQuery } from '@apps/links/src/application/queries/get-group-link-by-id.query';
import { GetGroupLinkByIdResponse } from '@apps/links/src/application/responses/get-group-link-by-id.response';

@Controller('group-links')
@UseGuards(JwtAuthGuard)
export class GroupLinksController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @ApiOkResponse({ type: GetGroupLinkByIdResponse, description: 'Group link retrieved successfully' })
  async getGroupLinkById(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: number): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    return this.queryBus.execute(new GetGroupLinkByIdQuery(id, userId));
  }
}
