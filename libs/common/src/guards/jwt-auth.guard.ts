import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EJwtType, JwtPayloadPlain } from '@common/auth';
import { CommonSessionControlService, UserSession } from '@common/redis/session';

import type { Request } from 'express';
import type { UUID } from 'node:crypto';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionControlService: CommonSessionControlService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { authorization = '' } = request.headers;
    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayloadPlain<number>>(token);
      if (payload.tokenType !== EJwtType.ACCESS) {
        throw new UnauthorizedException();
      }

      const userSession = { userId: payload.sub, sessionId: payload.jti as UUID } as UserSession;
      const key = this.sessionControlService.getUserSessionKey(userSession);
      const session = await this.sessionControlService.getSession(key);
      if (!session) {
        throw new UnauthorizedException();
      }

      (request as Request & { user: JwtPayloadPlain<number> }).user = payload;
      return true;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
  }
}
