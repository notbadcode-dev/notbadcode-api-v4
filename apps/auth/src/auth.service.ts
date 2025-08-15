import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoginResponseDto } from './application/dtos';
import { JwtPayload } from './application/value-objects/jwt-payload.vo';
import { JwtConstants } from './constants';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(payload: JwtPayload): Promise<LoginResponseDto> {
    const accessToken = await this.jwtService.signAsync(payload.toPlainObject(), {
      expiresIn: JwtConstants.expiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload.toPlainObject(), {
      expiresIn: JwtConstants.refreshExpiresIn,
    });

    return new LoginResponseDto(accessToken, refreshToken);
  }
}
