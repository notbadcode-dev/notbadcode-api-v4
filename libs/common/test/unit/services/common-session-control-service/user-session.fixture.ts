// userSession.fixture.ts

import { type UserSession } from '@common/redis/session/user-session.model';

export class UserSessionFixture {
  static create(): UserSession {
    return {
      userId: 1,
      sessionId: '123e4567-e89b-12d3-a456-426614174000',
      loginAt: '2025-08-23T12:34:56.789Z',
    };
  }
}
