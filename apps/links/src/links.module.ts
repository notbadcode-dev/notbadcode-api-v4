import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CommonConfigModule } from '@common/config';
import { CommonI18nModule } from '@common/i18n';
import { CommonLoggerModule } from '@common/loggers';
import { CommonCacheModule } from '@common/redis/cache';
import { CommonSessionControlModule } from '@common/redis/session';

import { LinksController } from '@apps/links/src/links.controller';

import { LinksHealthController } from './links-healtz.controller';

@Module({
  imports: [
    CommonConfigModule,
    CommonLoggerModule,
    CommonI18nModule,
    CommonCacheModule,
    CommonSessionControlModule,
    CqrsModule,
  ],
  controllers: [LinksController, LinksHealthController],
  providers: [],
})
export class LinksModule {}
