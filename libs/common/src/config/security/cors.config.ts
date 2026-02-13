import { SecurityConstants } from '@common/constants/security.constants';

import { ENV_DEFAULTS, ENV_KEYS } from '@common/config/environment';

import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function getCorsConfig(): CorsOptions {
  const corsOrigins = (process.env[ENV_KEYS.CORS_ORIGINS] || (ENV_DEFAULTS[ENV_KEYS.CORS_ORIGINS] as string))
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean);

  return {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    maxAge: SecurityConstants.corsMaxAgePreflight24Hrs,
  };
}
