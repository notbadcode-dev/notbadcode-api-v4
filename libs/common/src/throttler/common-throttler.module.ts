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
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: config.get<number>(ENV_KEYS.THROTTLE_TTL, ENV_DEFAULTS[ENV_KEYS.THROTTLE_TTL] as number),
            limit: config.get<number>(ENV_KEYS.THROTTLE_LIMIT, ENV_DEFAULTS[ENV_KEYS.THROTTLE_LIMIT] as number),
          },
        ],
      }),
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
