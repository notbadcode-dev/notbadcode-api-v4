import { type UUID } from 'crypto';

import { EJwtType } from '@common/auth';
import { type UserSession } from '@common/redis/session/user-session.model';
import { type ApiFailureResponse, EApiResponseMessageType } from '@common/responses';

import { LoginResponse } from '@apps/auth/src/application/responses';
import { type JwtPayload } from '@apps/auth/src/application/value-objects';
import { AuthErrorMessageConstants } from '@apps/auth/src/constants';
import { User } from '@apps/auth/src/domain/entities';

export class BaseHandlerFixture {
  static testEmail(): string {
    return 'test@test.com';
  }

  static testPassword(): string {
    return '123456';
  }

  static getValidUUID(): string {
    return this.getValidJti();
  }

  static validTokens(): LoginResponse {
    return new LoginResponse('a', 'r');
  }

  static invalidToken(): string {
    return 'invalid.jwt.token';
  }

  static emptyTokens(): LoginResponse {
    return new LoginResponse('', '');
  }

  static getValidJti(): string {
    return '00000000-0000-0000-0000-000000000000';
  }

  static getInvalidJti(): string {
    return 'not-a-uuid';
  }

  static getUserSessionKey(): string {
    return 'user-session-key';
  }

  static existingUser(): User {
    const user = new User();

    user.id = 1;
    user.email = 'test@test.com';
    user.passwordHash = 'hash';
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.lastLoginAt = null;
    user.lastLogoutAt = null;

    return user;
  }

  static createdUser(): User {
    const u = this.existingUser();
     
    u.id = 3;

    return u;
  }

  static getUserSession(): UserSession {
    return {
      userId: this.existingUser().id,
      sessionId: this.getValidJti(),
      loginAt: new Date().toISOString(),
    } as UserSession;
  }

  static getUserSessionWithDate(): UserSession {
    const userSession = this.getUserSession();

    return {
      ...userSession,
      loginAt: new Date().toISOString(),
    } as UserSession;
  }

  static mockJwtPayload(): JwtPayload {
    return {
      userId: 1,
      email: this.testEmail(),
      jti: this.getValidUUID() as UUID,
      toPlainObject: () => ({
        sub: 1,
        jti: this.getValidUUID() as UUID,
        email: this.testEmail(),
        tokenType: EJwtType.REFRESH,
      }),
    };
  }

  static mockJwtPayloadWithInvalidJti(): JwtPayload {
    return {
      userId: 1,
      email: this.testEmail(),
      jti: this.getInvalidJti() as UUID,
      toPlainObject: () => ({
        sub: 1,
        jti: this.getInvalidJti() as UUID,
        email: this.testEmail(),
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
