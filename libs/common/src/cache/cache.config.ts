import { type ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

import { ENV_KEYS } from '@common/config';
import { RedisCacheConstants } from '@common/constants/redisCache.constants';

import type { CacheModuleOptions } from '@nestjs/cache-manager';

export async function cacheConfigFactory(config: ConfigService): Promise<CacheModuleOptions> {
  const url = config.get<string>(ENV_KEYS.REDIS_CACHE_URL);

  const store = await redisStore({ url });

  return {
    store,
    ttl: RedisCacheConstants.ttlMs, // Default TTL for cache entries
    isGlobal: true,
  } satisfies CacheModuleOptions;
}
