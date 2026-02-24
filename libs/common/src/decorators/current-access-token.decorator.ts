import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { Request } from 'express';

export function extractAccessTokenFromRequest(request: Request): string {
  const { authorization = '' } = request.headers;
  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return '';
  }

  return token;
}

export const CurrentAccessToken = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return extractAccessTokenFromRequest(request);
});
