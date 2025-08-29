import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { RedisSessionControlConstants } from '@common/constants/redisSessionControl.constants';

import { UserSession } from './userSession.model';

import type { Cache } from 'cache-manager';

@Injectable()
export class CommonSessionControlService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async setSession<T>(
    key: string,
    value: T,
    ttl = RedisSessionControlConstants.oneDayTtl,
  ): Promise<string | null> {
    try {
      return await this.cache.set(key, JSON.stringify(value), ttl);
    } catch {
      return null;
    }
  }

  async getSession(key: string): Promise<UserSession | null> {
    const raw = await this.cache.get<string>(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UserSession;
    } catch {
      return null;
    }
  }

  async deleteSession(key: string): Promise<boolean | null> {
    try {
      return await this.cache.del(key);
    } catch {
      return null;
    }
  }

  getUserSessionKey(userSession: UserSession): string {
    return `${RedisSessionControlConstants.sessionPrefix}:${userSession.userId}:${userSession.sessionId}`;
  }
}
