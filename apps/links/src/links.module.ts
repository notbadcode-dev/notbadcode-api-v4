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
  GetFavoriteGroupsHandler,
  GetFavoriteLinksHandler,
  GetGroupLinkByIdHandler,
  GetGroupLinksPaginatedHandler,
  GetLinkByIdHandler,
  GetLinksPaginatedHandler,
  GetTotalsHandler,
  MarkGroupLinksAsFavoriteHandler,
  MarkLinksAsFavoriteHandler,
  UnmarkGroupLinksAsFavoriteHandler,
  UnmarkLinksAsFavoriteHandler,
  UpdateGroupLinkHandler,
  UpdateLinkHandler,
} from '@apps/links/src/application/handlers';
import { LinkService, LinkValidationService } from '@apps/links/src/application/services';
import { DashboardLinkController } from '@apps/links/src/dashboard-link.controller';
import { GroupLink, Link } from '@apps/links/src/domain/entities';
import { GROUP_LINK_REPOSITORY_TOKEN, LINK_REPOSITORY_TOKEN } from '@apps/links/src/domain/ports';
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
  controllers: [LinksController, GroupLinksController, LinksHealthController, DashboardLinkController],
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
    GetFavoriteLinksHandler,
    GetFavoriteGroupsHandler,
    GetTotalsHandler,
    LinkService,
    LinkValidationService,
    {
      provide: LINK_REPOSITORY_TOKEN,
      useClass: TypeOrmLinkRepository,
    },
    {
      provide: GROUP_LINK_REPOSITORY_TOKEN,
      useClass: TypeOrmGroupLinkRepository,
    },
  ],
})
export class LinksModule {}
