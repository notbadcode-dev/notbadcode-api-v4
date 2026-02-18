import { type INestApplication, type Type } from '@nestjs/common';
import { DocumentBuilder, type SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

import { SwaggerConstants } from '@common/constants';
import { PaginatedRequest } from '@common/requests';
import { ApiFailureResponseModel, ApiNullResponse, ApiResponseMessageModel } from '@common/responses';
import { type SwaggerInfo } from '@common/value-objects';

const COMMON_SWAGGER_MODELS: Type[] = [ApiNullResponse, ApiFailureResponseModel, ApiResponseMessageModel, PaginatedRequest];

export function buildSwaggerConfig(app: INestApplication, info: SwaggerInfo, extraModels: Type[] = []): void {
  const documentBuilder = new DocumentBuilder()
    .setTitle(info.title)
    .setDescription(info.description)
    .setVersion(info.version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder, {
    extraModels: [...COMMON_SWAGGER_MODELS, ...extraModels],
  });

  SwaggerModule.setup(SwaggerConstants.defaultPath, app, document, swaggerCustomOptions);
}

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: { persistAuthorization: true },
};

export async function buildSwaggerUrl(app: INestApplication, defaultPort: number): Promise<string> {
  const port = Number(process.env.PORT ?? defaultPort);

  const hasGetUrl = typeof app.getUrl === 'function';
  const rawUrl = hasGetUrl ? await app.getUrl.call(app) : SwaggerConstants.defaultHUrl(port);
  const url = new URL(rawUrl);

  url.hostname = SwaggerConstants.defaultHost;

  if (process.env.SSL_CERT_PATH) {
    url.protocol = SwaggerConstants.defaultProtocol;
  }

  if (!url.port) {
    url.port = String(port);
  }

  url.pathname = SwaggerConstants.defaultPath;

  return url.toString();
}
