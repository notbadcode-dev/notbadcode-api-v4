import { UUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { UserSession } from '@common/redis/session/userSession.model';

@Injectable()
export class UserService {
  getUserSessions(userId: number, jti: UUID): UserSession {
    return {
      userId: userId,
      sessionId: jti,
    } as UserSession;
  }

  getUserSessionWithDate(userId: number, jti: UUID): UserSession {
    const userSession = this.getUserSessions(userId, jti);
    return {
      ...userSession,
      loginAt: new Date().toISOString(),
    } as UserSession;
  }
}
