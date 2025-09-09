import { PatternConstants } from '@common/constants';
import { type I18nService } from '@common/i18n';
import { type ApiFailureResponse, EApiResponseMessageType, apiResponseFailure } from '@common/responses';

import { type JwtPayloadPlain } from '@apps/auth/src/application/value-objects/';
import { AuthErrorMessageConstants } from '@apps/auth/src/constants';
import { type EJwtType } from '@apps/auth/src/infrastructure/jwt/jwt-type.enum';

export class TokenValidationHelper {
  static async invalidToken(i18nService: I18nService): Promise<ApiFailureResponse> {
    return apiResponseFailure(i18nService, [
      { type: EApiResponseMessageType.Error, message: AuthErrorMessageConstants.invalidToken },
    ]);
  }

  static async invalidSessionId(i18nService: I18nService): Promise<ApiFailureResponse> {
    return apiResponseFailure(i18nService, [
      { type: EApiResponseMessageType.Error, message: AuthErrorMessageConstants.invalidSessionId },
    ]);
  }

  static async sessionNotActive(i18nService: I18nService): Promise<ApiFailureResponse> {
    return apiResponseFailure(i18nService, [
      { type: EApiResponseMessageType.Error, message: AuthErrorMessageConstants.sessionNotActive },
    ]);
  }

  static async invalidCredentials(i18nService: I18nService): Promise<ApiFailureResponse> {
    return apiResponseFailure(i18nService, [
      { type: EApiResponseMessageType.Error, message: AuthErrorMessageConstants.invalidCredentials },
    ]);
  }

  static async validateTokenPresence(
    token: string,
    i18nService: I18nService,
  ): Promise<ApiFailureResponse | null> {
    if (!token?.trim()) {
      return this.invalidToken(i18nService);
    }
    return null;
  }

  static async validatePayload(
    payload: JwtPayloadPlain<number>,
    i18nService: I18nService,
  ): Promise<ApiFailureResponse | null> {
    if (!payload) {
      return this.invalidToken(i18nService);
    }
    const { sub, jti, email } = payload;
    if (typeof sub !== 'number' || !jti || !email) {
      return this.invalidToken(i18nService);
    }
    return null;
  }

  static async validateTokenType(
    payload: JwtPayloadPlain<number>,
    expected: EJwtType,
    i18nService: I18nService,
  ): Promise<ApiFailureResponse | null> {
    if (!payload.tokenType || payload.tokenType !== expected) {
      return this.invalidToken(i18nService);
    }
    return null;
  }

  static async validateUUID(jti: string, i18nService: I18nService): Promise<ApiFailureResponse | null> {
    if (!PatternConstants.validationUUID.test(jti)) {
      return this.invalidSessionId(i18nService);
    }
    return null;
  }
}
