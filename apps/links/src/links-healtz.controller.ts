import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { I18nService } from '@common/i18n';
import { ApiResponse, apiResponseSuccess, IHealthzResponse } from '@common/responses';

import { LinksConstants } from './constants/links.constants';

@ApiTags('Health')
@Controller('healthz')
export class LinksHealthController {
  constructor(private readonly i18nService: I18nService) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns the health status of the Links service' })
  @ApiOkResponse({ description: 'Links service is healthy' })
  healthz(): Promise<ApiResponse<IHealthzResponse>> {
    return apiResponseSuccess(this.i18nService, {
      serviceName: LinksConstants.swaggerTitle,
      timestamp: new Date().toUTCString(),
    });
  }
}
