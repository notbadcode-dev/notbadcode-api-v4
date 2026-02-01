import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonConfigModule } from '@common/config';
import { CommonAuthGuardModule } from '@common/guards';
import { CommonI18nModule } from '@common/i18n';
import { CommonLoggerModule } from '@common/loggers';
import { CommonCacheModule } from '@common/redis/cache';
import { CommonSessionControlModule } from '@common/redis/session';

import { GetLinkByIdHandler } from '@apps/links/src/application/handlers/get-link-by-id.handler';
import { GetLinksPaginatedHandler } from '@apps/links/src/application/handlers/get-links-paginated.handler';
import { UpdateLinkHandler } from '@apps/links/src/application/handlers/update-link.handler';
import { Link } from '@apps/links/src/domain/entities/link.entity';
import { LinksDatabaseModule } from '@apps/links/src/infrastructure/database/links-database.module';
import { TypeOrmLinkRepository } from '@apps/links/src/infrastructure/repositories/typeorm-link.repository';
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
    LinksDatabaseModule,
    TypeOrmModule.forFeature([Link]),
    CommonAuthGuardModule,
    CqrsModule,
  ],
  controllers: [LinksController, LinksHealthController],
  providers: [
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
  ],
})
export class LinksModule {}
