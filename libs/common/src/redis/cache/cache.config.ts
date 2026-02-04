import { createKeyv } from '@keyv/redis';
import { type ConfigService } from '@nestjs/config';

import { ENV_KEYS } from '@common/config';
import { RedisCacheConstants } from '@common/constants/redis-cache.constants';

import type { CacheModuleOptions } from '@nestjs/cache-manager';

export async function cacheConfigFactory(config: ConfigService): Promise<CacheModuleOptions> {
  const url = config.get<string>(ENV_KEYS.REDIS_CACHE_URL);

  return {
    stores: [createKeyv(url)],
    ttl: RedisCacheConstants.ttlMs,
  } satisfies CacheModuleOptions;
}
