import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { ENV_DEFAULTS, ENV_KEYS } from '@common/config';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ttlString = config.get<string>(ENV_KEYS.THROTTLE_TTL, String(ENV_DEFAULTS[ENV_KEYS.THROTTLE_TTL]));
        const limitString = config.get<string>(ENV_KEYS.THROTTLE_LIMIT, String(ENV_DEFAULTS[ENV_KEYS.THROTTLE_LIMIT]));
        return {
          throttlers: [
            {
              name: 'default',
              ttl: parseInt(ttlString, 10),
              limit: parseInt(limitString, 10),
            },
          ],
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class CommonThrottlerModule {}
