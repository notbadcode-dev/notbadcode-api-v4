import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import { JwtPayloadPlain } from '@apps/auth/src/application/value-objects';
import { EJwtType } from '@apps/auth/src/infrastructure/jwt/jwt-type.enum';

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
      (request as any).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
