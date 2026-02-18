import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { I18nService } from '@common/i18n';
import { ApiResponse, apiResponseSuccess, IHealthzResponse } from '@common/responses';

import { AuthConstants } from './constants';

@ApiTags('Health')
@Controller('healthz')
export class AuthHealthController {
  constructor(private readonly i18nService: I18nService) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns the health status of the Auth service' })
  @ApiOkResponse({ description: 'Auth service is healthy' })
  healthz(): Promise<ApiResponse<IHealthzResponse>> {
    return apiResponseSuccess(this.i18nService, {
      serviceName: AuthConstants.swaggerTitle,
      timestamp: new Date().toUTCString(),
    });
  }
}
