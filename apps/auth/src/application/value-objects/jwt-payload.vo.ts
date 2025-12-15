import { randomUUID, type UUID } from 'node:crypto';

import { EJwtType, type JwtPayloadPlain } from '@common/auth';
import { PatternConstants } from '@common/constants';
import { ErrorOnFactory, type ErrorOn } from '@common/types/error-on.type';

import { AuthErrorMessageConstants } from '@apps/auth/src/constants';

export class JwtPayload {
  private constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly jti: UUID,
  ) {}

  static create(userId: number, email: string): ErrorOn<JwtPayload> {
    if (!Number.isInteger(userId) || userId <= 0) {
      return ErrorOnFactory.error(AuthErrorMessageConstants.invalidUserId);
    }

    if (!email || !PatternConstants.validationEmail.test(email)) {
      return ErrorOnFactory.error(AuthErrorMessageConstants.invalidEmail);
    }

    const newPayload = new JwtPayload(userId, email, randomUUID());

    return ErrorOnFactory.success(newPayload);
  }

  toPlainObject(): JwtPayloadPlain<number> {
    return { sub: this.userId, email: this.email, jti: this.jti, tokenType: EJwtType.ACCESS };
  }
}
