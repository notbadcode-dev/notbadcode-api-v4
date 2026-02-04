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

import { CreateLinkHandler } from '@apps/links/src/application/handlers/create-link.handler';
import { DeleteLinkHandler } from '@apps/links/src/application/handlers/delete-link.handler';
import { GetGroupLinkByIdHandler } from '@apps/links/src/application/handlers/get-group-link-by-id.handler';
import { GetLinkByIdHandler } from '@apps/links/src/application/handlers/get-link-by-id.handler';
import { GetLinksPaginatedHandler } from '@apps/links/src/application/handlers/get-links-paginated.handler';
import { UpdateLinkHandler } from '@apps/links/src/application/handlers/update-link.handler';
import { GroupLink } from '@apps/links/src/domain/entities/group-link.entity';
import { Link } from '@apps/links/src/domain/entities/link.entity';
import { LinksDatabaseModule } from '@apps/links/src/infrastructure/database/links-database.module';
import { TypeOrmGroupLinkRepository } from '@apps/links/src/infrastructure/repositories/typeorm-group-link.repository';
import { TypeOrmLinkRepository } from '@apps/links/src/infrastructure/repositories/typeorm-link.repository';
import { GroupLinksController } from '@apps/links/src/group-links.controller';
import { LinksHealthController } from '@apps/links/src/links-healtz.controller';
import { LinksController } from '@apps/links/src/links.controller';

import { MarkLinksAsFavoriteHandler } from './application/handlers/mark-links-as-favorite.handler';
import { UnmarkLinksAsFavoriteHandler } from './application/handlers/unmark-links-as-favorite.handler';
import { LinkService } from './application/services/link.service';

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
    CreateLinkHandler,
    DeleteLinkHandler,
    GetGroupLinkByIdHandler,
    GetLinkByIdHandler,
    GetLinksPaginatedHandler,
    UpdateLinkHandler,
    MarkLinksAsFavoriteHandler,
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
