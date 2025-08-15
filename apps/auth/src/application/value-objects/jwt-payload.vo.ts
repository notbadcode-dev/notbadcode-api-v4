import { PatternConstants } from '@common/constants';
import { type ApiResponse, type ApiResponseService } from '@common/responses';

import { AuthErrorMessageConstants } from '../../constants';

export class JwtPayload {
  private constructor(
    public readonly userId: number,
    public readonly email: string,
  ) {}

  static create(userId: number, email: string, apiResponse: ApiResponseService): ApiResponse<JwtPayload> {
    if (!Number.isInteger(userId) || userId <= 0) {
      return apiResponse.error([AuthErrorMessageConstants.invalidUserId]);
    }

    if (!email || !PatternConstants.patternValidationEmail.test(email)) {
      return apiResponse.error([AuthErrorMessageConstants.invalidEmail]);
    }

    return apiResponse.success(new JwtPayload(userId, email));
  }

  toPlainObject(): { sub: number; email: string } {
    return { sub: this.userId, email: this.email };
  }
}
