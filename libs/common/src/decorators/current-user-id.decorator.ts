import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { type JwtPayloadPlain } from '@common/auth';

import type { Request } from 'express';

export function extractUserIdFromRequest(request: Request & { user: JwtPayloadPlain<number> }): number {
  return request.user.sub;
}

export const CurrentUserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): number => {
  const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayloadPlain<number> }>();
  return extractUserIdFromRequest(request);
});
