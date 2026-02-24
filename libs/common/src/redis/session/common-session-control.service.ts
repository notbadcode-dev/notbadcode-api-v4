import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

import { RedisSessionControlConstants } from '@common/constants/redis-session-control.constants';

import { UserSession } from './user-session.model';

import type { Cache } from 'cache-manager';

@Injectable()
export class CommonSessionControlService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly logger: Logger,
  ) {}

  async setSession<T>(key: string, value: T, ttl = RedisSessionControlConstants.oneDayTtl): Promise<string> {
    try {
      return await this.cache.set(key, JSON.stringify(value), ttl);
    } catch (error) {
      this.logger.error(error);
      throw new ServiceUnavailableException('Session store unavailable');
    }
  }

  async getSession(key: string): Promise<UserSession | null> {
    const raw = await this.cache.get<string>(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UserSession;
    } catch (error) {
      this.logger.error(error);
      throw new ServiceUnavailableException('Session store unavailable');
    }
  }

  async deleteSession(key: string): Promise<boolean> {
    try {
      const exists = await this.cache.get(key);
      if (!exists) {
        return false;
      }
      return await this.cache.del(key);
    } catch (error) {
      this.logger.error(error);
      throw new ServiceUnavailableException('Session store unavailable');
    }
  }

  getUserSessionKey(userSession: UserSession): string {
    return `${RedisSessionControlConstants.sessionPrefix}:${userSession.userId}:${userSession.sessionId}`;
  }
}
