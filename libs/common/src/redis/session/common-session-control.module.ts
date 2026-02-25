import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ENV_KEYS } from '@common/config';
import { RedisSessionControlConstants } from '@common/constants/redis-session-control.constants';

import { CommonSessionControlService } from './common-session-control.service';
import { SESSION_MANAGER } from './session-manager.token';

@Module({
  imports: [ConfigModule],
  providers: [
    CommonSessionControlService,
    Logger,
    {
      provide: SESSION_MANAGER,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { createCache } = await import('cache-manager');
        const { createKeyv } = await import('@keyv/redis');

        // Manual creation to avoid CACHE_MANAGER conflict
        return createCache({
          stores: [createKeyv(configService.get(ENV_KEYS.REDIS_SESSION_URL))],
          ttl: RedisSessionControlConstants.defaultTtl,
        });
      },
    },
  ],
  exports: [CommonSessionControlService],
})
export class CommonSessionControlModule {}
