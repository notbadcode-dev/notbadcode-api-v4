import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CacheAccessor } from './cache-accessor';
import { cacheConfigFactory } from './cache.config';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheConfigFactory,
    }),
  ],
  providers: [CacheAccessor],
  exports: [CacheAccessor],
})
export class CommonCacheModule {}
