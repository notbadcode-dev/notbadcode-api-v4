/* eslint-disable @typescript-eslint/no-magic-numbers */
import { LoginResponseDto } from 'apps/auth/src/application/dtos';
import { type JwtPayload } from 'apps/auth/src/application/value-objects';

export class AuthServiceFixture {
  static validJwtPayload: JwtPayload = {
    userId: 1,
    email: 'test@test.com',
    toPlainObject: () => ({
      sub: 1,
      email: 'test@test.com',
    }),
  };

  static failJwtPayload: JwtPayload = {
    userId: 2,
    email: 'fail@test.com',
    toPlainObject: () => ({
      sub: 2,
      email: 'fail@test.com',
    }),
  };

  static validAccessToken = 'access-token';
  static validRefreshToken = 'refresh-token';

  static validLoginResponse = new LoginResponseDto(
    AuthServiceFixture.validAccessToken,
    AuthServiceFixture.validRefreshToken,
  );

  static emptyLoginResponse = new LoginResponseDto('', '');
}
