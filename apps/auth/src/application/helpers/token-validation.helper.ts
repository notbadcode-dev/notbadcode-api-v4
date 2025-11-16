import { type EJwtType, type JwtPayloadPlain } from '@common/auth';
import { PatternConstants } from '@common/constants';
import { ErrorOnFactory, type ErrorOn } from '@common/types';

import { AuthErrorMessageConstants } from '@apps/auth/src/constants';

export class TokenValidationHelper {
  static async validateTokenPresence(token: string): Promise<ErrorOn<boolean>> {
    if (!token?.trim()) {
      return ErrorOnFactory.error(AuthErrorMessageConstants.invalidToken);
    }

    return ErrorOnFactory.success(true);
  }

  static async validatePayload(payload: JwtPayloadPlain<number>): Promise<ErrorOn<boolean>> {
    if (!payload) {
      return ErrorOnFactory.error(AuthErrorMessageConstants.invalidToken);
    }

    const { sub, jti, email } = payload;
    if (typeof sub !== 'number' || !jti || !email) {
      return ErrorOnFactory.error(AuthErrorMessageConstants.invalidToken);
    }

    return ErrorOnFactory.success(true);
  }

  static async validateTokenType(payload: JwtPayloadPlain<number>, expected: EJwtType): Promise<ErrorOn<boolean>> {
    if (!payload.tokenType || payload.tokenType !== expected) {
      return ErrorOnFactory.error(AuthErrorMessageConstants.invalidToken);
    }

    return ErrorOnFactory.success(true);
  }

  static async validateUUID(jti: string): Promise<ErrorOn<boolean>> {
    const isValid = PatternConstants.validationUUID.test(jti);

    if (isValid) {
      return ErrorOnFactory.success(isValid);
    }

    return ErrorOnFactory.error(AuthErrorMessageConstants.invalidSessionId);
  }
}
