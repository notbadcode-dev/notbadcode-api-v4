import { randomUUID, type UUID } from 'node:crypto';

import { PatternConstants } from '@common/constants';
import { type ApiResponse, type ApiResponseService } from '@common/responses';

import { AuthErrorMessageConstants } from '@apps/auth/src/constants';
import { EJwtType, type JwtPayloadPlain } from '@common/auth';

export class JwtPayload {
  private constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly jti: UUID,
  ) {}

  static create(userId: number, email: string, apiResponse: ApiResponseService): ApiResponse<JwtPayload> {
    if (!Number.isInteger(userId) || userId <= 0) {
      return apiResponse.error([AuthErrorMessageConstants.invalidUserId]);
    }

    if (!email || !PatternConstants.validationEmail.test(email)) {
      return apiResponse.error([AuthErrorMessageConstants.invalidEmail]);
    }

    return apiResponse.success(new JwtPayload(userId, email, randomUUID()));
  }

  toPlainObject(): JwtPayloadPlain<number> {
    return { sub: this.userId, email: this.email, jti: this.jti, tokenType: EJwtType.ACCESS };
  }
}
