import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { type JwtPayloadPlain } from '@common/auth';

import type { Request } from 'express';

export const CurrentUserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): number => {
  const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayloadPlain<number> }>();
  return request.user.sub;
});
