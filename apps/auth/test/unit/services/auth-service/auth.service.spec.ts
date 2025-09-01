import { type JwtService } from '@nestjs/jwt';
import { mockDeep } from 'jest-mock-extended';

import { AuthService } from 'apps/auth/src/auth.service';
import { JwtConstants } from 'apps/auth/src/constants';

import { AuthServiceFixture } from './auth.service.fixture';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    jwtService = mockDeep<JwtService>();
    service = new AuthService(jwtService);
  });

  it('should generate access and refresh tokens using JwtService', async () => {
    // Arrange
    jwtService.signAsync
      .mockResolvedValueOnce(AuthServiceFixture.validAccessToken)
      .mockResolvedValueOnce(AuthServiceFixture.validRefreshToken);

    // Act
    const result = await service.generateTokens(AuthServiceFixture.validJwtPayload);

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      AuthServiceFixture.validJwtPayload.toPlainObject(),
      {
        expiresIn: JwtConstants.expiresIn,
      },
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      AuthServiceFixture.validJwtPayload.toPlainObject(),
      {
        expiresIn: JwtConstants.refreshExpiresIn,
      },
    );

    expect(result).toBeInstanceOf(AuthServiceFixture.validLoginResponse.constructor);
    expect(result.accessToken).toBe(AuthServiceFixture.validAccessToken);
    expect(result.refreshToken).toBe(AuthServiceFixture.validRefreshToken);
  });

  it('should propagate errors from JwtService', async () => {
    // Arrange
    jwtService.signAsync.mockRejectedValue(new Error('signAsync failed'));

    // Act & Assert
    await expect(service.generateTokens(AuthServiceFixture.failJwtPayload)).rejects.toThrow(
      'signAsync failed',
    );
  });
});
