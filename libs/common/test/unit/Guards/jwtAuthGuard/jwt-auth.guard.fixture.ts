import { EJwtType } from '@common/auth';

export class JwtAuthGuardFixture {
  static readonly secret = 'test-secret';

  static readonly validPayload = {
    sub: 1,
    email: 'test@example.com',
    jti: 'uuid',
    tokenType: EJwtType.ACCESS,
  } as const;

  static readonly refreshPayload = {
    sub: 1,
    email: 'test@example.com',
    jti: 'uuid',
    tokenType: EJwtType.REFRESH,
  } as const;
}
