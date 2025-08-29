import { type ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

import { ENV_KEYS } from '@common/config';
import { RedisSessionControlConstants } from '@common/constants/redisSessionControl.constants';

export async function sessionControlConfigFactory(config: ConfigService) {
  const url = config.get<string>(ENV_KEYS.REDIS_SESSION_URL);
  const store = await redisStore({ url });
  return {
    store,
    ttl: RedisSessionControlConstants.defaultTtl,
  };
}
