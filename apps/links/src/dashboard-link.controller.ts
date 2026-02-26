import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { SwaggerConstants } from '@common/constants';
import { CurrentUserId } from '@common/decorators';
import { JwtAuthGuard } from '@common/guards';
import { ApiFailureResponseModel, ApiResponse, createApiResponse } from '@common/responses';

import { GetTotalsQuery } from '@apps/links/src/application/queries';
import { GetTotalsResponse } from '@apps/links/src/application/responses';

@ApiTags('Dashboard Links')
@ApiBearerAuth()
@Controller('dashboard-links')
@UseGuards(JwtAuthGuard)
export class DashboardLinkController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get link and group totals', description: 'Retrieves the total number of links and groups for the authenticated user' })
  @ApiOkResponse({ type: createApiResponse(GetTotalsResponse), description: 'Totals retrieved successfully' })
  @ApiUnauthorizedResponse({ type: ApiFailureResponseModel, description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async getTotals(@CurrentUserId() userId: number): Promise<ApiResponse<GetTotalsResponse>> {
    return this.queryBus.execute(new GetTotalsQuery(userId));
  }
}
