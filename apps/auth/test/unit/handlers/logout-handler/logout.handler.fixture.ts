import { type UUID } from 'crypto';

import { EJwtType, type JwtPayloadPlain } from '@common/auth';
import { type UserSession } from '@common/redis/session/userSession.model';
import { EApiResponseMessageType, type ApiFailureResponse } from '@common/responses';

import { AuthErrorMessageConstants } from '@apps/auth/src/constants';

import { BaseHandlerFixture } from '../base.handler.fixture';

export class LogoutHandlerFixture extends BaseHandlerFixture {
  static spacesToken(): string {
    return '     ';
  }

  static validJwtPayload(): JwtPayloadPlain<number> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      sub: 2,
      jti: this.getValidJti() as UUID,
      email: this.testEmail(),
      tokenType: EJwtType.ACCESS,
    };
  }

  static validDecoded(): { sub: number; jti: string; email: string } {
    return this.validJwtPayload();
  }

  static invalidJwtPayload(): { sub?: number; jti?: string; email?: string } {
    return {};
  }

  static userSession(): UserSession {
    return {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      userId: 2,
      sessionId: this.getValidJti() as UUID,
    };
  }

  static sessionActive(): UserSession {
    return { ...this.userSession() };
  }

  static invalidCredentialsResponse(): ApiFailureResponse {
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
}
