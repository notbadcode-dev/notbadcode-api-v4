import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { Request } from 'express';

export const CurrentAccessToken = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const { authorization = '' } = request.headers;
  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return '';
  }

  return token;
});
