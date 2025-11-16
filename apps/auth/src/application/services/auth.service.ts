import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { EJwtType } from '@common/auth';
import { ENV_KEYS } from '@common/config';

import { LoginResponseDto } from '@apps/auth/src/application/dtos';
import { JwtPayload } from '@apps/auth/src/application/value-objects/jwt-payload.vo';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: JwtPayload): Promise<LoginResponseDto> {
    const accessToken = await this.jwtService.signAsync(
      { ...payload.toPlainObject(), tokenType: EJwtType.ACCESS },
      {
        expiresIn: this.configService.get<string>(ENV_KEYS.AUTH_JWT_EXPIRES_IN),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { ...payload.toPlainObject(), tokenType: EJwtType.REFRESH },
      {
        expiresIn: this.configService.get<string>(ENV_KEYS.AUTH_JWT_REFRESH_EXPIRES_IN),
      },
    );

    return new LoginResponseDto(accessToken, refreshToken);
  }
}
