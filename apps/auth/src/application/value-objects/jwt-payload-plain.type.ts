import { type UUID } from 'node:crypto';

export interface JwtPayloadPlain<T> {
  sub: T;
  jti: UUID;
  email: string;
}
