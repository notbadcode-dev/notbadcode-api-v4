import { type UUID } from 'node:crypto';

import { type UserSession } from '@common/redis/session/user-session.model';

export class UserServiceFixture {
  static userId(): number {
     
    return 12345;
  }

  static sessionId(): UUID {
    return '550e8400-e29b-41d4-a716-446655440000' as UUID;
  }

  static loginDate(): Date {
    return new Date('2024-01-01T12:00:00.000Z');
  }

  static userSession(): UserSession {
    return {
      userId: this.userId(),
      sessionId: this.sessionId(),
    };
  }

  static userSessionWithDate(): UserSession {
    return {
      ...this.userSession(),
      loginAt: this.loginDate().toISOString(),
    };
  }
}
