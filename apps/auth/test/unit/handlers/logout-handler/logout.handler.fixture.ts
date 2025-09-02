// apps/auth/test/unit/handlers/logout-handler/logout.handler.fixture.ts
import { type UUID } from 'crypto';

export class LogoutHandlerFixture {
  static testToken(): string {
    return 'test.token';
  }

  static invalidToken(): string {
    return 'invalid.token';
  }

  static decodedToken(): { sub: number; jti: UUID } {
    return { sub: 1, jti: '00000000-0000-0000-0000-000000000000' as UUID };
  }
}
