import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { SwaggerConstants } from '@common/constants';
import { CurrentUserId } from '@common/decorators';
import { JwtAuthGuard } from '@common/guards';
import { PaginatedRequest } from '@common/requests';
import { ApiFailureResponseModel, ApiResponse, createApiResponse, createPaginatedResponse, SuccessFailureResponse } from '@common/responses';

import { CreateLinkCommand, DeleteLinkCommand, MarkLinksAsFavoriteCommand, UnmarkLinksAsFavoriteCommand, UpdateLinkCommand } from '@apps/links/src/application/commands';
import { GetFavoriteLinksQuery, GetLinkByIdQuery, GetLinksPaginatedQuery } from '@apps/links/src/application/queries';
import { CreateLinkRequest, MarkLinksAsFavoriteRequest, UnmarkLinksAsFavoriteRequest, UpdateLinkRequest } from '@apps/links/src/application/requests';
import { GetFavoriteLinksResponse, GetLinkByIdResponse } from '@apps/links/src/application/responses';
import { LinksSwaggerConstants } from '@apps/links/src/constants';

@ApiTags('Links')
@ApiBearerAuth()
@Controller('links')
@UseGuards(JwtAuthGuard)
export class LinksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a link', description: 'Creates a new link for the authenticated user' })
  @ApiOkResponse({ type: createApiResponse(GetLinkByIdResponse), description: 'Link created successfully' })
  @ApiBadRequestResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidRequestBody })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async createLink(@Body() request: CreateLinkRequest, @CurrentUserId() userId: number): Promise<ApiResponse<GetLinkByIdResponse>> {
    return this.commandBus.execute(new CreateLinkCommand(request, userId));
  }

  @Get('favorite-list')
  @ApiOperation({ summary: 'Get favorite links', description: 'Retrieves a list of favorite links (not in any group) for the authenticated user' })
  @ApiOkResponse({ type: createApiResponse(GetFavoriteLinksResponse), description: 'Favorite links retrieved successfully' })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async getFavoriteLinks(@CurrentUserId() userId: number): Promise<ApiResponse<GetFavoriteLinksResponse>> {
    return this.queryBus.execute(new GetFavoriteLinksQuery(userId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a link by ID', description: 'Retrieves the full details of a link by its ID' })
  @ApiParam({ name: 'id', type: Number, description: LinksSwaggerConstants.links.paramId })
  @ApiOkResponse({ type: createApiResponse(GetLinkByIdResponse), description: 'Link retrieved successfully' })
  @ApiNotFoundResponse({ type: ApiFailureResponseModel, description: LinksSwaggerConstants.links.notFound })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async getLinkById(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: number): Promise<ApiResponse<GetLinkByIdResponse>> {
    return this.queryBus.execute(new GetLinkByIdQuery(id, userId));
  }

  @Post('paginated')
  @ApiOperation({ summary: 'Get paginated links', description: 'Retrieves a paginated list of links for the authenticated user' })
  @ApiOkResponse({ type: createApiResponse(createPaginatedResponse(GetLinkByIdResponse)), description: 'Paginated links retrieved successfully' })
  @ApiBadRequestResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidPaginationParameters })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async getLinksPaginated(@Body() request: PaginatedRequest, @CurrentUserId() userId: number): Promise<InstanceType<ReturnType<typeof createPaginatedResponse>>> {
    return this.queryBus.execute(new GetLinksPaginatedQuery(request, userId));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a link', description: 'Updates an existing link by its ID' })
  @ApiParam({ name: 'id', type: Number, description: LinksSwaggerConstants.links.paramId })
  @ApiOkResponse({ type: createApiResponse(GetLinkByIdResponse), description: 'Link updated successfully' })
  @ApiBadRequestResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidRequestBody })
  @ApiNotFoundResponse({ type: ApiFailureResponseModel, description: LinksSwaggerConstants.links.notFound })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async updateLink(@Param('id', ParseIntPipe) id: number, @Body() request: UpdateLinkRequest, @CurrentUserId() userId: number): Promise<ApiResponse<GetLinkByIdResponse>> {
    return this.commandBus.execute(new UpdateLinkCommand(id, request, userId));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a link', description: 'Deletes a link by its ID' })
  @ApiParam({ name: 'id', type: Number, description: LinksSwaggerConstants.links.paramId })
  @ApiOkResponse({ type: createApiResponse(GetLinkByIdResponse), description: 'Link deleted successfully' })
  @ApiNotFoundResponse({ type: ApiFailureResponseModel, description: LinksSwaggerConstants.links.notFound })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async deleteLink(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: number): Promise<ApiResponse<GetLinkByIdResponse>> {
    return this.commandBus.execute(new DeleteLinkCommand(id, userId));
  }

  @Post('favorite')
  @ApiOperation({ summary: 'Mark links as favorite', description: 'Marks a list of links as favorite by their IDs' })
  @ApiOkResponse({ type: createApiResponse(SuccessFailureResponse), description: 'Links marked as favorite' })
  @ApiBadRequestResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidRequestBody })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async markLinksAsFavorite(@Body() body: MarkLinksAsFavoriteRequest, @CurrentUserId() userId: number): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    return this.commandBus.execute(new MarkLinksAsFavoriteCommand(body, userId));
  }

  @Post('unfavorite')
  @ApiOperation({ summary: 'Unmark links as favorite', description: 'Removes the favorite mark from a list of links by their IDs' })
  @ApiOkResponse({ type: createApiResponse(SuccessFailureResponse), description: 'Links unmarked as favorite' })
  @ApiBadRequestResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidRequestBody })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async unmarkLinksAsFavorite(@Body() body: UnmarkLinksAsFavoriteRequest, @CurrentUserId() userId: number): Promise<ApiResponse<SuccessFailureResponse<number>>> {
    return this.commandBus.execute(new UnmarkLinksAsFavoriteCommand(body, userId));
  }
}
