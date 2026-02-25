import * as fs from 'fs';
import * as path from 'path';

import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import open from 'open';

import { buildSwaggerConfig, buildSwaggerUrl, ENV_DEFAULTS, ENV_KEYS, getCorsConfig, helmetConfig, helmetConfigDev, permissionsPolicyMiddleware } from '@common/config';
import { CommonConstants, SecurityConstants } from '@common/constants';
import { GlobalExceptionFilter, ValidationExceptionFilter } from '@common/filters';
import { I18nService } from '@common/i18n';
import { LoggingInterceptor, TransformResponseInterceptor } from '@common/interceptors';
import { loggerConfiguration } from '@common/loggers';
import { SwaggerInfo } from '@common/value-objects';

import { AuthModule } from 'apps/auth/src/auth.module';
import { AuthConstants } from 'apps/auth/src/constants';

import { AuthCredentialsRequest, LoginRequest, RefreshRequest, RegisterRequest } from './application/requests';
import { LoginResponse } from './application/responses';

async function bootstrap(): Promise<void> {
  const app = await createApp();
  const isProd = process.env.NODE_ENV === CommonConstants.productionEnvironmentTag;

  app.use(express.json({ limit: SecurityConstants.bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: SecurityConstants.bodyLimit }));

  app.use(helmet(isProd ? helmetConfig : helmetConfigDev));
  app.use(permissionsPolicyMiddleware);

  app.enableCors(getCorsConfig());

  addSwaggerConfiguration(app);

  const i18n = app.get(I18nService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(app.get(LoggingInterceptor), new TransformResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter(), new ValidationExceptionFilter(i18n));

  const listenPort = Number(process.env.AUTH_PORT || ENV_DEFAULTS[ENV_KEYS.AUTH_PORT]);
  await app.listen(listenPort, AuthConstants.nodeInspectHost);

  console.info(AuthConstants.listenAppMessage(listenPort));

  if (process.env.NODE_ENV !== CommonConstants.productionEnvironmentTag) {
    const swaggerUrl = await buildSwaggerUrl(app, listenPort);
    await open(swaggerUrl);
  }
}

void bootstrap();

async function createApp(): Promise<INestApplication> {
  const isProd = true; // FORCE HTTPS for e2e tests
  let httpsOptions: { key: Buffer; cert: Buffer } | undefined;

  if (isProd) {
    const key = fs.readFileSync(process.env.SSL_KEY_PATH ?? path.resolve(ENV_DEFAULTS[ENV_KEYS.SSL_KEY_PATH]));
    const cert = fs.readFileSync(process.env.SSL_CERT_PATH ?? path.resolve(ENV_DEFAULTS[ENV_KEYS.SSL_CERT_PATH]));
    httpsOptions = { key, cert };
  }

  return await NestFactory.create(AuthModule, {
    ...(httpsOptions ? { httpsOptions } : {}),
    logger: WinstonModule.createLogger(loggerConfiguration()),
  });
}

function addSwaggerConfiguration(app: INestApplication): void {
  const info = SwaggerInfo.create(AuthConstants.swaggerTitle, AuthConstants.swaggerDescription, AuthConstants.swaggerVersion);

  buildSwaggerConfig(app, info, [AuthCredentialsRequest, LoginRequest, RegisterRequest, RefreshRequest, LoginResponse]);
}
