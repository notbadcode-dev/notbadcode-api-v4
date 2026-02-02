import * as fs from 'fs';
import * as path from 'path';

import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { I18nService } from '@common/i18n';
import open from 'open';

import { buildSwaggerConfig, buildSwaggerUrl, ENV_DEFAULTS, ENV_KEYS } from '@common/config';
import { CommonConstants } from '@common/constants';
import { ValidationExceptionFilter } from '@common/filters';
import { LoggingInterceptor } from '@common/interceptors';
import { loggerConfiguration } from '@common/loggers';
import { SwaggerInfo } from '@common/value-objects';

import { LinksConstants } from './constants/links.constants';
import { LinksModule } from './links.module';

async function bootstrap(): Promise<void> {
  const app = await createApp();

  const corsOrigins = (process.env[ENV_KEYS.CORS_ORIGINS] || (ENV_DEFAULTS[ENV_KEYS.CORS_ORIGINS] as string))
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  });

  addSwaggerConfiguration(app);

  const i18n = app.get(I18nService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(app.get(LoggingInterceptor));
  app.useGlobalFilters(new ValidationExceptionFilter(i18n));

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
  const isProd = process.env.NODE_ENV === CommonConstants.productionEnvironmentTag;
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
  const info = SwaggerInfo.create(
    LinksConstants.swaggerTitle,
    LinksConstants.swaggerDescription,
    LinksConstants.swaggerVersion,
  );

  buildSwaggerConfig(app, info);
}
