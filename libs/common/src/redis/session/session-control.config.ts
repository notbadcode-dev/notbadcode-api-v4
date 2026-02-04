import { createKeyv } from '@keyv/redis';
import { type CacheModuleOptions } from '@nestjs/cache-manager';
import { type ConfigService } from '@nestjs/config';

import { ENV_KEYS } from '@common/config';
import { RedisSessionControlConstants } from '@common/constants/redis-session-control.constants';

export async function sessionControlConfigFactory(config: ConfigService): Promise<CacheModuleOptions> {
  const url = config.get<string>(ENV_KEYS.REDIS_SESSION_URL);
  return {
    stores: [createKeyv(url)],
    ttl: RedisSessionControlConstants.defaultTtl,
  };
}
