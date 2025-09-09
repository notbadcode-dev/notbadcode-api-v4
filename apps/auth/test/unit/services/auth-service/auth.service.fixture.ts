/* eslint-disable @typescript-eslint/no-magic-numbers */
import { type JwtPayload } from '@apps/auth/src/application/value-objects/jwt-payload.vo';
import { EJwtType } from '@common/auth';

export class AuthServiceFixture {
  static validJwtPayload: JwtPayload = {
    userId: 123,
    email: 'test@email.com',
    jti: '123e4567-e89b-12d3-a456-426614174000',
    toPlainObject: () => ({
      sub: 123,
      email: 'test@email.com',
      jti: '123e4567-e89b-12d3-a456-426614174000',
      tokenType: EJwtType.ACCESS,
    }),
  };

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
