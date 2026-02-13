import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse } from '@nestjs/swagger';

import { CurrentUserId } from '@common/decorators';
import { JwtAuthGuard } from '@common/guards';
import { PaginatedRequest } from '@common/requests';
import { ApiResponse, createPaginatedResponse, SuccessFailureResponse } from '@common/responses';

import { CreateGroupLinkCommand, DeleteGroupLinkCommand, MarkGroupLinksAsFavoriteCommand, UnmarkGroupLinksAsFavoriteCommand, UpdateGroupLinkCommand } from '@apps/links/src/application/commands';
import { GetGroupLinkByIdQuery, GetGroupLinksPaginatedQuery } from '@apps/links/src/application/queries';
import { CreateGroupLinkRequest, MarkGroupLinksAsFavoriteRequest, UnmarkGroupLinksAsFavoriteRequest, UpdateGroupLinkRequest } from '@apps/links/src/application/requests';
import { GetGroupLinkByIdResponse } from '@apps/links/src/application/responses';

@Controller('group-links')
@UseGuards(JwtAuthGuard)
export class GroupLinksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOkResponse({ type: GetGroupLinkByIdResponse, description: 'Group link created successfully' })
  async createGroupLink(@Body() request: CreateGroupLinkRequest, @CurrentUserId() userId: number): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    return this.commandBus.execute(new CreateGroupLinkCommand(request, userId));
  }

  @Post('paginated')
  @ApiOkResponse({ type: createPaginatedResponse(GetGroupLinkByIdResponse), description: 'Paginated group links retrieved successfully' })
  async getGroupLinksPaginated(@Body() request: PaginatedRequest, @CurrentUserId() userId: number): Promise<InstanceType<ReturnType<typeof createPaginatedResponse>>> {
    return this.queryBus.execute(new GetGroupLinksPaginatedQuery(request, userId));
  }

  @Post('favorite')
  @ApiOkResponse({ type: SuccessFailureResponse<number>, description: 'Group links marked as favorite' })
  async markGroupLinksAsFavorite(@Body() body: MarkGroupLinksAsFavoriteRequest, @CurrentUserId() userId: number): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    return this.commandBus.execute(new MarkGroupLinksAsFavoriteCommand(body, userId));
  }

  @Post('unfavorite')
  @ApiOkResponse({ type: SuccessFailureResponse<number>, description: 'Group links unmarked as favorite' })
  async unmarkGroupLinksAsFavorite(@Body() body: UnmarkGroupLinksAsFavoriteRequest, @CurrentUserId() userId: number): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    return this.commandBus.execute(new UnmarkGroupLinksAsFavoriteCommand(body, userId));
  }

  @Get(':id')
  @ApiOkResponse({ type: GetGroupLinkByIdResponse, description: 'Group link retrieved successfully' })
  async getGroupLinkById(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: number): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    return this.queryBus.execute(new GetGroupLinkByIdQuery(id, userId));
  }

  @Patch(':id')
  @ApiOkResponse({ type: GetGroupLinkByIdResponse, description: 'Group link updated successfully' })
  async updateGroupLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateGroupLinkRequest,
    @CurrentUserId() userId: number,
  ): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    return this.commandBus.execute(new UpdateGroupLinkCommand(id, request, userId));
  }

  @Delete(':id')
  @ApiOkResponse({ type: GetGroupLinkByIdResponse, description: 'Group link deleted successfully' })
  async deleteGroupLink(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: number): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    return this.commandBus.execute(new DeleteGroupLinkCommand(id, userId));
  }
}
