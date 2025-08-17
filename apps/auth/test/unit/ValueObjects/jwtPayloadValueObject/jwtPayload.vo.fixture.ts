/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  EApiResponseMessageType,
  type ApiFailureResponse,
  type ApiResponseService,
  type ApiSuccessResponse,
} from '@common/responses';

import { JwtPayload } from 'apps/auth/src/application/value-objects/jwt-payload.vo';
import { AuthErrorMessageConstants } from 'apps/auth/src/constants/authErrorMessage.constants';

export class JwtPayloadFixture {
  static validUserId(): number {
    return 2;
  }

  static invalidUserId(): number {
    return 0;
  }

  static validEmail(): string {
    return 'valid@mail.com';
  }

  static invalidEmail(): string {
    return 'invalid-email';
  }

  static emptyEmail(): string {
    return '';
  }

  static expectedPlainObject(): Readonly<{ sub: number; email: string }> {
    return { sub: this.validUserId(), email: this.validEmail() } as const;
  }

  static apiResponse(): ApiResponseService {
    return {
      success: <T>(data: T): ApiSuccessResponse<T> => ({
        success: true,
        messageList: [],
        data,
      }),
      error: (messages: string[] = [], code?: string): ApiFailureResponse => ({
        success: false,
        messageList: messages.map((m) => ({
          type: EApiResponseMessageType.Error,
          message: m,
        })),
        code,
      }),
      warning: (messages: string[] = [], code?: string): ApiFailureResponse => ({
        success: false,
        messageList: messages.map((m) => ({
          type: EApiResponseMessageType.Warning,
          message: m,
        })),
        code,
      }),
    };
  }

  static validPayloadInstance(userId: number = this.validUserId(), email: string = this.validEmail()) {
    return JwtPayload.create(userId, email, this.apiResponse());
  }

  static errors() {
    return {
      invalidUserId: AuthErrorMessageConstants.invalidUserId,
      invalidEmail: AuthErrorMessageConstants.invalidEmail,
    } as const;
  }
}
