 
 
 
 
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

import { CreateGroupLinkRequest, CreateLinkRequest, MarkGroupLinksAsFavoriteRequest, MarkLinksAsFavoriteRequest, UnmarkGroupLinksAsFavoriteRequest, UnmarkLinksAsFavoriteRequest, UpdateGroupLinkRequest, UpdateLinkRequest } from './application/requests';
import { GetGroupLinkByIdResponse, GetLinkByIdResponse, GroupLinkBasicResponse, LinkBasicResponse } from './application/responses';
import { LinksConstants } from './constants/links.constants';
import { LinksModule } from './links.module';

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

  const listenPort = Number(process.env.LINKS_PORT || ENV_DEFAULTS[ENV_KEYS.LINKS_PORT]);
  await app.listen(listenPort, LinksConstants.nodeInspectHost);

  console.info(LinksConstants.listenAppMessage(listenPort));

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

  return await NestFactory.create(LinksModule, {
    ...(httpsOptions ? { httpsOptions } : {}),
    logger: WinstonModule.createLogger(loggerConfiguration()),
  });
}

function addSwaggerConfiguration(app: INestApplication): void {
  const info = SwaggerInfo.create(LinksConstants.swaggerTitle, LinksConstants.swaggerDescription, LinksConstants.swaggerVersion);

  buildSwaggerConfig(app, info, [
    CreateLinkRequest, UpdateLinkRequest,
    CreateGroupLinkRequest, UpdateGroupLinkRequest,
    MarkLinksAsFavoriteRequest, UnmarkLinksAsFavoriteRequest,
    MarkGroupLinksAsFavoriteRequest, UnmarkGroupLinksAsFavoriteRequest,
    LinkBasicResponse, GetLinkByIdResponse,
    GroupLinkBasicResponse, GetGroupLinkByIdResponse,
  ]);
}
