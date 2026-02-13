import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse } from '@nestjs/swagger';

import { CurrentUserId } from '@common/decorators';
import { JwtAuthGuard } from '@common/guards';
import { PaginatedRequest } from '@common/requests';
import { ApiResponse, createPaginatedResponse, SuccessFailureResponse } from '@common/responses';

import { CreateLinkCommand, DeleteLinkCommand, MarkLinksAsFavoriteCommand, UnmarkLinksAsFavoriteCommand, UpdateLinkCommand } from '@apps/links/src/application/commands';
import { GetLinkByIdQuery, GetLinksPaginatedQuery } from '@apps/links/src/application/queries';
import { CreateLinkRequest, MarkLinksAsFavoriteRequest, UnmarkLinksAsFavoriteRequest, UpdateLinkRequest } from '@apps/links/src/application/requests';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses';

@Controller('links')
@UseGuards(JwtAuthGuard)
export class LinksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOkResponse({ type: GetLinkByIdResponse, description: 'Link created successfully' })
  async createLink(@Body() request: CreateLinkRequest, @CurrentUserId() userId: number): Promise<ApiResponse<GetLinkByIdResponse>> {
    return this.commandBus.execute(new CreateLinkCommand(request, userId));
  }

  @Get(':id')
  @ApiOkResponse({ type: GetLinkByIdResponse, description: 'Link retrieved successfully' })
  async getLinkById(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: number): Promise<ApiResponse<GetLinkByIdResponse>> {
    return this.queryBus.execute(new GetLinkByIdQuery(id, userId));
  }

  @Post('paginated')
  @ApiOkResponse({ type: createPaginatedResponse(GetLinkByIdResponse), description: 'Paginated links retrieved successfully' })
  async getLinksPaginated(@Body() request: PaginatedRequest, @CurrentUserId() userId: number): Promise<InstanceType<ReturnType<typeof createPaginatedResponse>>> {
    return this.queryBus.execute(new GetLinksPaginatedQuery(request, userId));
  }

  @Patch(':id')
  @ApiOkResponse({ type: GetLinkByIdResponse, description: 'Link updated successfully' })
  async updateLink(@Param('id', ParseIntPipe) id: number, @Body() request: UpdateLinkRequest, @CurrentUserId() userId: number): Promise<ApiResponse<GetLinkByIdResponse>> {
    return this.commandBus.execute(new UpdateLinkCommand(id, request, userId));
  }

  @Delete(':id')
  @ApiOkResponse({ type: GetLinkByIdResponse, description: 'Link deleted successfully' })
  async deleteLink(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: number): Promise<ApiResponse<GetLinkByIdResponse>> {
    return this.commandBus.execute(new DeleteLinkCommand(id, userId));
  }

  @Post('favorite')
  @ApiOkResponse({ type: SuccessFailureResponse<number>, description: 'Links marked as favorite' })
  async markLinksAsFavorite(@Body() body: MarkLinksAsFavoriteRequest, @CurrentUserId() userId: number): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    return this.commandBus.execute(new MarkLinksAsFavoriteCommand(body, userId));
  }

  @Post('unfavorite')
  @ApiOkResponse({ type: SuccessFailureResponse<number>, description: 'Links unmarked as favorite' })
  async unmarkLinksAsFavorite(@Body() body: UnmarkLinksAsFavoriteRequest, @CurrentUserId() userId: number): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    return this.commandBus.execute(new UnmarkLinksAsFavoriteCommand(body, userId));
  }
}
