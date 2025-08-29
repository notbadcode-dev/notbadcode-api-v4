import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { cacheConfigFactory } from './cache.config';
import { CacheAccessor } from './cacheAccessor';

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
  exports: [CacheModule],
})
export class CommonCacheModule {}
