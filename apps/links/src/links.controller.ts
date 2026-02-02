import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse } from '@nestjs/swagger';

import { CurrentUserId } from '@common/decorators';
import { JwtAuthGuard } from '@common/guards';
import { PaginatedRequest } from '@common/requests';
import { ApiResponse, createPaginatedResponse, SuccessFailureResponse } from '@common/responses';

import { UpdateLinkCommand } from '@apps/links/src/application/commands/update-link.command';
import { GetLinkByIdQuery } from '@apps/links/src/application/queries/get-link-by-id.query';
import { GetLinksPaginatedQuery } from '@apps/links/src/application/queries/get-links-paginated.query';
import { UpdateLinkRequest } from '@apps/links/src/application/requests/update-link.request';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';

import { MarkLinksAsFavoriteCommand } from './application/commands/mark-links-as-favorite.command';
import { UnmarkLinksAsFavoriteCommand } from './application/commands/unmark-links-as-favorite.command';
import { MarkLinksAsFavoriteRequest } from './application/requests/mark-links-as-favorite.request';
import { UnmarkLinksAsFavoriteRequest } from './application/requests/unmark-links-as-favorite.request';

@Controller('links')
@UseGuards(JwtAuthGuard)
export class LinksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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
