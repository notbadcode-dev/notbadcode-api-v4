import { type ApiFailureResponse, EApiResponseMessageType } from '@common/responses';

import { LoginResponseDto } from 'apps/auth/src/application/dtos';
import { type JwtPayload } from 'apps/auth/src/application/value-objects';

import { AuthErrorMessageConstants } from '../../../../src/constants';

export class RefreshHandlerFixture {
  static accessToken(): string {
    return 'REFRESH_TOKEN';
  }

  static decoded(): { sub: number; email: string } {
    return { sub: 1, email: 'test@test.com' };
  }

  static validTokens(): LoginResponseDto {
    return new LoginResponseDto('a', 'r');
  }

  static invalidTokenResponse(): ApiFailureResponse {
    return {
      success: false,
      messageList: [
        {
          type: EApiResponseMessageType.Error,
          message: AuthErrorMessageConstants.invalidCredentials,
        },
      ],
    };
  }

  static mockJwtPayload(): JwtPayload {
    return {
      userId: 1,
      email: 'test@test.com',
      jti: 'uuid-0000-0000-0000-000000000000',
      toPlainObject: () => ({ sub: 1, email: 'test@test.com' }),
    };
  }
}

