import { type UUID } from 'crypto';

import { EJwtType } from '@common/auth';
import { type ApiFailureResponse, EApiResponseMessageType } from '@common/responses';

import { LoginResponseDto } from '@apps/auth/src/application/dtos';
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

  static validTokens(): LoginResponseDto {
    return new LoginResponseDto('a', 'r');
  }

  static invalidToken(): string {
    return 'invalid.jwt.token';
  }

  static emptyTokens(): LoginResponseDto {
    return new LoginResponseDto('', '');
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
    const u = new User();

    u.id = 1;
    u.email = this.testEmail();
    u.passwordHash = 'hash';
    u.createdAt = new Date();
    u.updatedAt = new Date();
    u.lastLoginAt = null;
    u.lastLogoutAt = null;

    return u;
  }

  static createdUser(): User {
    const u = this.existingUser();
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    u.id = 3;

    return u;
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
