import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EJwtType, JwtPayloadPlain } from '@common/auth';

import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

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
      (request as Request & { user: JwtPayloadPlain<number> }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
