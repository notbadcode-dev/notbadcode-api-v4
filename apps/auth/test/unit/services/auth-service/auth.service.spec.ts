import { type JwtService } from '@nestjs/jwt';
import { mockDeep } from 'jest-mock-extended';

import { ENV_KEYS } from '@common/config';

import { AuthService } from '@apps/auth/src/auth.service';

import { AuthServiceFixture } from './auth.service.fixture';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: { get: jest.Mock };

  beforeEach(() => {
    jwtService = mockDeep<JwtService>();
    configService = { get: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    service = new AuthService(jwtService, configService as any);
  });

it('should generate access and refresh tokens using JwtService', async () => {
  // Arrange
  jwtService.signAsync
    .mockResolvedValueOnce(AuthServiceFixture.validAccessToken)
    .mockResolvedValueOnce(AuthServiceFixture.validRefreshToken);

  configService.get.mockImplementation((key: string, fallback: string) => {
    if (key === ENV_KEYS.AUTH_JWT_EXPIRES_IN) {
      return AuthServiceFixture.accessTokenExpiresIn();
    }
    if (key === ENV_KEYS.AUTH_JWT_REFRESH_EXPIRES_IN) {
      return AuthServiceFixture.refreshTokenExpiresIn();
    }
    return fallback;
  });

  // Act
  const result = await service.generateTokens(AuthServiceFixture.validJwtPayload);

  // Assert
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(jwtService.signAsync).toHaveBeenCalledWith(
    { ...AuthServiceFixture.validJwtPayload.toPlainObject(), tokenType: 'access' },
    { expiresIn: AuthServiceFixture.accessTokenExpiresIn() },
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(jwtService.signAsync).toHaveBeenCalledWith(
    { ...AuthServiceFixture.validJwtPayload.toPlainObject(), tokenType: 'refresh' },
    { expiresIn: AuthServiceFixture.refreshTokenExpiresIn() },
  );

  expect(result).toBeInstanceOf(AuthServiceFixture.validLoginResponse.constructor);
  expect(result.accessToken).toBe(AuthServiceFixture.validAccessToken);
  expect(result.refreshToken).toBe(AuthServiceFixture.validRefreshToken);
});


  it('should propagate errors from JwtService', async () => {
    // Arrange
    jwtService.signAsync.mockRejectedValue(new Error('signAsync failed'));
    configService.get.mockReturnValue(AuthServiceFixture.accessTokenExpiresIn());

    // Act & Assert
    await expect(service.generateTokens(AuthServiceFixture.failJwtPayload)).rejects.toThrow(
      'signAsync failed',
    );
  });
});
