import { type UUID } from 'crypto';

import { type ApiFailureResponse, EApiResponseMessageType } from '@common/responses';

import { LoginResponseDto } from '@apps/auth/src/application/dtos';
import { type JwtPayload } from '@apps/auth/src/application/value-objects';
import { AuthErrorMessageConstants } from '@apps/auth/src/constants';
import { EJwtType } from '@apps/auth/src/infrastructure/jwt/jwt-type.enum';

export class RefreshHandlerFixture {
  static accessToken(): string {
    return 'REFRESH_TOKEN';
  }

  static getValidEmail(): string {
    return 'test@test.com';
  }

  static getValidUUID(): UUID {
    return '123e4567-e89b-12d3-a456-426614174000' as UUID;
  }

  static getSessionKey(): string {
    return `session::1:${this.getValidUUID()}`;
  }

  static validTokens(): LoginResponseDto {
    return new LoginResponseDto('a', 'r');
  }

  static mockJwtPayload(): JwtPayload {
    return {
      userId: 1,
      email: this.getValidEmail(),
      jti: this.getValidUUID(),
      toPlainObject: () => ({
        sub: 1,
        jti: this.getValidUUID(),
        email: this.getValidEmail(),
        tokenType: EJwtType.REFRESH,
      }),
    };
  }

  static invalidTokenResponse(): ApiFailureResponse {
    return {
      success: false,
      messageList: [
        {
          type: EApiResponseMessageType.Error,
          message: AuthErrorMessageConstants.invalidToken,
        },
      ],
    };
  }

  static invalidSessionIdResponse(): ApiFailureResponse {
    return {
      success: false,
      messageList: [
        {
          type: EApiResponseMessageType.Error,
          message: AuthErrorMessageConstants.invalidSessionId,
        },
      ],
    };
  }

  static sessionNotActiveResponse(): ApiFailureResponse {
    return {
      success: false,
      messageList: [
        {
          type: EApiResponseMessageType.Error,
          message: AuthErrorMessageConstants.sessionNotActive,
        },
      ],
    };
  }
}
