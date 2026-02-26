import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { SwaggerConstants } from '@common/constants';
import { CurrentUserId } from '@common/decorators';
import { JwtAuthGuard } from '@common/guards';
import { PaginatedRequest } from '@common/requests';
import { ApiFailureResponseModel, ApiResponse, createApiResponse, createPaginatedResponse, SuccessFailureResponse } from '@common/responses';

import { CreateGroupLinkCommand, DeleteGroupLinkCommand, MarkGroupLinksAsFavoriteCommand, UnmarkGroupLinksAsFavoriteCommand, UpdateGroupLinkCommand } from '@apps/links/src/application/commands';
import { GetFavoriteGroupsQuery, GetGroupLinkByIdQuery, GetGroupLinksPaginatedQuery } from '@apps/links/src/application/queries';
import { CreateGroupLinkRequest, MarkGroupLinksAsFavoriteRequest, UnmarkGroupLinksAsFavoriteRequest, UpdateGroupLinkRequest } from '@apps/links/src/application/requests';
import { GetFavoriteGroupsResponse, GetGroupLinkByIdResponse } from '@apps/links/src/application/responses';
import { LinksSwaggerConstants } from '@apps/links/src/constants';

@ApiTags('Group Links')
@ApiBearerAuth()
@Controller('group-links')
@UseGuards(JwtAuthGuard)
export class GroupLinksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a group link', description: 'Creates a new group link for the authenticated user' })
  @ApiOkResponse({ type: createApiResponse(GetGroupLinkByIdResponse), description: 'Group link created successfully' })
  @ApiBadRequestResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidRequestBody })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async createGroupLink(@Body() request: CreateGroupLinkRequest, @CurrentUserId() userId: number): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    return this.commandBus.execute(new CreateGroupLinkCommand(request, userId));
  }

  @Post('paginated')
  @ApiOperation({ summary: 'Get paginated group links', description: 'Retrieves a paginated list of group links for the authenticated user' })
  @ApiOkResponse({ type: createApiResponse(createPaginatedResponse(GetGroupLinkByIdResponse)), description: 'Paginated group links retrieved successfully' })
  @ApiBadRequestResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidPaginationParameters })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async getGroupLinksPaginated(@Body() request: PaginatedRequest, @CurrentUserId() userId: number): Promise<InstanceType<ReturnType<typeof createPaginatedResponse>>> {
    return this.queryBus.execute(new GetGroupLinksPaginatedQuery(request, userId));
  }

  @Post('favorite')
  @ApiOperation({ summary: 'Mark group links as favorite', description: 'Marks a list of group links as favorite by their IDs' })
  @ApiOkResponse({ type: createApiResponse(SuccessFailureResponse), description: 'Group links marked as favorite' })
  @ApiBadRequestResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidRequestBody })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async markGroupLinksAsFavorite(@Body() body: MarkGroupLinksAsFavoriteRequest, @CurrentUserId() userId: number): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    return this.commandBus.execute(new MarkGroupLinksAsFavoriteCommand(body, userId));
  }

  @Post('unfavorite')
  @ApiOperation({ summary: 'Unmark group links as favorite', description: 'Removes the favorite mark from a list of group links by their IDs' })
  @ApiOkResponse({ type: createApiResponse(SuccessFailureResponse), description: 'Group links unmarked as favorite' })
  @ApiBadRequestResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidRequestBody })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async unmarkGroupLinksAsFavorite(@Body() body: UnmarkGroupLinksAsFavoriteRequest, @CurrentUserId() userId: number): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    return this.commandBus.execute(new UnmarkGroupLinksAsFavoriteCommand(body, userId));
  }

  @Get('favorite-list')
  @ApiOperation({ summary: 'Get favorite group links', description: 'Retrieves a list of favorite group links for the authenticated user' })
  @ApiOkResponse({ type: createApiResponse(GetFavoriteGroupsResponse), description: 'Favorite group links retrieved successfully' })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async getFavoriteGroups(@CurrentUserId() userId: number): Promise<ApiResponse<GetFavoriteGroupsResponse>> {
    return this.queryBus.execute(new GetFavoriteGroupsQuery(userId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group link by ID', description: 'Retrieves the full details of a group link by its ID, including its links' })
  @ApiParam({ name: 'id', type: Number, description: LinksSwaggerConstants.groupLinks.paramId })
  @ApiOkResponse({ type: createApiResponse(GetGroupLinkByIdResponse), description: 'Group link retrieved successfully' })
  @ApiNotFoundResponse({ type: ApiFailureResponseModel, description: LinksSwaggerConstants.groupLinks.notFound })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async getGroupLinkById(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: number): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    return this.queryBus.execute(new GetGroupLinkByIdQuery(id, userId));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a group link', description: 'Updates an existing group link by its ID' })
  @ApiParam({ name: 'id', type: Number, description: LinksSwaggerConstants.groupLinks.paramId })
  @ApiOkResponse({ type: createApiResponse(GetGroupLinkByIdResponse), description: 'Group link updated successfully' })
  @ApiBadRequestResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidRequestBody })
  @ApiNotFoundResponse({ type: ApiFailureResponseModel, description: LinksSwaggerConstants.groupLinks.notFound })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async updateGroupLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateGroupLinkRequest,
    @CurrentUserId() userId: number,
  ): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    return this.commandBus.execute(new UpdateGroupLinkCommand(id, request, userId));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group link', description: 'Deletes a group link by its ID' })
  @ApiParam({ name: 'id', type: Number, description: LinksSwaggerConstants.groupLinks.paramId })
  @ApiOkResponse({ type: createApiResponse(GetGroupLinkByIdResponse), description: 'Group link deleted successfully' })
  @ApiNotFoundResponse({ type: ApiFailureResponseModel, description: LinksSwaggerConstants.groupLinks.notFound })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async deleteGroupLink(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: number): Promise<ApiResponse<GetGroupLinkByIdResponse>> {
    return this.commandBus.execute(new DeleteGroupLinkCommand(id, userId));
  }
}
