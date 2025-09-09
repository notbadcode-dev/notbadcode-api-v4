/* eslint-disable @typescript-eslint/no-magic-numbers */
import { type UUID } from 'crypto';

import { type UserSession } from '@common/redis/session/userSession.model';
import { EApiResponseMessageType, type ApiFailureResponse } from '@common/responses';

import { AuthErrorMessageConstants } from '@apps/auth/src/constants';
import { type User } from '@apps/auth/src/domain/entities';
import { EJwtType, type JwtPayloadPlain } from '@common/auth';

export class LogoutHandlerFixture {
  static validToken(): string {
    return 'valid.jwt.token';
  }

  static emptyToken(): string {
    return '';
  }

  static spacesToken(): string {
    return '     ';
  }

  static invalidToken(): string {
    return 'invalid.jwt.token';
  }

  static getValidUUID(): UUID {
    return '123e4567-e89b-12d3-a456-426614174000' as UUID;
  }

  static validJwtPayload(): JwtPayloadPlain<number> {
    return {
      sub: 2,
      jti: this.validJti() as UUID,
      email: this.validEmail(),
      tokenType: EJwtType.ACCESS,
    };
  }

  static validDecoded(): { sub: number; jti: string; email: string } {
    return this.validJwtPayload();
  }

  static invalidJwtPayload(): { sub?: number; jti?: string; email?: string } {
    return {};
  }
  static nullDecoded(): null {
    return null;
  }

  static validJti(): string {
    return '123e4567-e89b-12d3-a456-426614174000';
  }
  static invalidJti(): string {
    return 'not-a-uuid';
  }

  static validEmail(): string {
    return 'test@test.com';
  }
  static userFound(): Partial<User> {
    return { id: 2, email: this.validEmail() };
  }
  static userNotFound(): UserSession | null {
    return null;
  }
  static userSession(): UserSession {
    return {
      userId: 2,
      sessionId: this.validJti() as UUID,
    };
  }
  static sessionActive(): UserSession {
    return { ...this.userSession() };
  }
  static sessionInactive(): UserSession | null {
    return null;
  }
  static getUserSessionKey(): string {
    return 'user-session-key';
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
