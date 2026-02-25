import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonConfigModule } from '@common/config';
import { CommonAuthGuardModule } from '@common/guards';
import { CommonI18nModule } from '@common/i18n';
import { CommonLoggerModule } from '@common/loggers';
import { CommonCacheModule } from '@common/redis/cache';
import { CommonSessionControlModule } from '@common/redis/session';
import { CommonThrottlerModule } from '@common/throttler';

import {
  CreateGroupLinkHandler,
  CreateLinkHandler,
  DeleteGroupLinkHandler,
  DeleteLinkHandler,
  GetGroupLinkByIdHandler,
  GetGroupLinksPaginatedHandler,
  GetLinkByIdHandler,
  GetLinksPaginatedHandler,
  MarkGroupLinksAsFavoriteHandler,
  MarkLinksAsFavoriteHandler,
  UnmarkGroupLinksAsFavoriteHandler,
  UnmarkLinksAsFavoriteHandler,
  UpdateGroupLinkHandler,
  UpdateLinkHandler,
} from '@apps/links/src/application/handlers';
import { LinkService } from '@apps/links/src/application/services';
import { GroupLink, Link } from '@apps/links/src/domain/entities';
import { GroupLinksController } from '@apps/links/src/group-links.controller';
import { LinksDatabaseModule } from '@apps/links/src/infrastructure/database';
import { TypeOrmGroupLinkRepository, TypeOrmLinkRepository } from '@apps/links/src/infrastructure/repositories';
import { LinksHealthController } from '@apps/links/src/links-healtz.controller';
import { LinksController } from '@apps/links/src/links.controller';

@Module({
  imports: [
    CommonConfigModule,
    CommonLoggerModule,
    CommonI18nModule,
    CommonCacheModule,
    CommonSessionControlModule,
    CommonThrottlerModule,
    LinksDatabaseModule,
    TypeOrmModule.forFeature([Link, GroupLink]),
    CommonAuthGuardModule,
    CqrsModule,
  ],
  controllers: [LinksController, GroupLinksController, LinksHealthController],
  providers: [
    CreateGroupLinkHandler,
    CreateLinkHandler,
    DeleteGroupLinkHandler,
    DeleteLinkHandler,
    GetGroupLinkByIdHandler,
    GetGroupLinksPaginatedHandler,
    GetLinkByIdHandler,
    GetLinksPaginatedHandler,
    UpdateGroupLinkHandler,
    UpdateLinkHandler,
    MarkGroupLinksAsFavoriteHandler,
    MarkLinksAsFavoriteHandler,
    UnmarkGroupLinksAsFavoriteHandler,
    UnmarkLinksAsFavoriteHandler,
    LinkService,
    {
      provide: 'ILinkRepository',
      useClass: TypeOrmLinkRepository,
    },
    {
      provide: 'IGroupLinkRepository',
      useClass: TypeOrmGroupLinkRepository,
    },
  ],
})
export class LinksModule {}
