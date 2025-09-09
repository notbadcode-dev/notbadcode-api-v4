// apps/auth/test/unit/Handlers/loginHandler/login.handler.fixture.ts
import { type UUID } from 'crypto';

import { type ApiFailureResponse, EApiResponseMessageType } from '@common/responses';

import { LoginResponseDto } from '@apps/auth/src/application/dtos';
import { type JwtPayload } from '@apps/auth/src/application/value-objects';
import { User } from '@apps/auth/src/domain/entities/user.entity';
import { EJwtType } from '@apps/auth/src/infrastructure/jwt/jwt-type.enum';

import { AuthErrorMessageConstants } from '../../../../src/constants';

export class LoginHandlerFixture {
  static testEmail(): string {
    return 'test@test.com';
  }

  static testPassword(): string {
    return '123456';
  }

  static invalidEmail(): string {
    return 'no@exists.com';
  }

  static invalidPassword(): string {
    return 'pwd';
  }

  static validUser(): User {
    const u = new User();
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    u.id = 3;
    u.email = this.testEmail();
    u.passwordHash = 'hash';
    u.createdAt = new Date();
    u.updatedAt = new Date();
    u.lastLoginAt = null;
    u.lastLogoutAt = null;
    return u;
  }

  static validTokens() {
    return { accessToken: 'a', refreshToken: 'r' } as const;
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

  static payloadErrorResponse(): ApiFailureResponse {
    return {
      success: false,
      messageList: [
        {
          type: EApiResponseMessageType.Error,
          message: 'Error creating payload',
        },
      ],
    };
  }

  static getValidJti(): string {
    return '00000000-0000-0000-0000-000000000000';
  }

  static getInvalidJti(): string {
    return 'not-a-uuid';
  }

  static mockJwtPayload(user: User, jti: string = LoginHandlerFixture.getValidJti()): JwtPayload {
    return {
      userId: user.id,
      email: user.email,
      jti: jti as UUID,
      toPlainObject: () => ({
        sub: user.id,
        email: user.email,
        jti: jti as UUID,
        tokenType: EJwtType.ACCESS,
      }),
    };
  }

  static emptyTokens(): LoginResponseDto {
    return new LoginResponseDto('', '');
  }
}
