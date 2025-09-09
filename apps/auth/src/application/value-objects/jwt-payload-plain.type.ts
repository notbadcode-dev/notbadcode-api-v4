import { type UUID } from 'node:crypto';

import { type EJwtType } from '@apps/auth/src/infrastructure/jwt/jwt-type.enum';

export interface JwtPayloadPlain<T> {
  sub: T;
  jti: UUID;
  email: string;
  tokenType: EJwtType;
}
