 
import { EJwtType } from '@common/auth';

import { type JwtPayload } from '@apps/auth/src/application/value-objects/jwt-payload.vo';
import { BaseHandlerFixture } from '@apps/auth/test/unit/handlers/base.handler.fixture';

export class AuthServiceFixture {
  static validJwtPayload: JwtPayload = BaseHandlerFixture.mockJwtPayload();

  static failJwtPayload: JwtPayload = {
    userId: 456,
    email: 'fail@email.com',
    jti: 'fail-uuid-0000-0000-0000-000000000000',
    toPlainObject: () => ({
      sub: 456,
      email: 'fail@email.com',
      jti: 'fail-uuid-0000-0000-0000-000000000000',
      tokenType: EJwtType.ACCESS,
    }),
  };

  static validAccessToken = 'ACCESS_TOKEN';
  static validRefreshToken = 'REFRESH_TOKEN';
  static validLoginResponse = { accessToken: 'ACCESS_TOKEN', refreshToken: 'REFRESH_TOKEN' };

  static accessTokenExpiresIn(): string {
    return '15m';
  }

  static refreshTokenExpiresIn(): string {
    return '7d';
  }
}
