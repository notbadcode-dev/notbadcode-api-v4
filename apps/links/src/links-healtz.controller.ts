// apps/auth/src/health.controller.ts

import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { I18nService } from '@common/i18n';
import { ApiResponse, apiResponseSuccess, IHealthzResponse } from '@common/responses';

import { LinksConstants } from './constants/links.constants';

@Controller('healthz')
export class LinksHealthController {
  constructor(private readonly i18nService: I18nService) {}

  @Get()
  @ApiOkResponse({ description: 'Health check successful' })
  healthz(): Promise<ApiResponse<IHealthzResponse>> {
    return apiResponseSuccess(this.i18nService, {
      serviceName: LinksConstants.swaggerTitle,
      timestamp: new Date().toUTCString(),
    });
  }
}
