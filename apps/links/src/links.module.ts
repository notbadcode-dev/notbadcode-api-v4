import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonConfigModule } from '@common/config';
import { CommonI18nModule } from '@common/i18n';
import { CommonLoggerModule } from '@common/loggers';
import { CommonCacheModule } from '@common/redis/cache';
import { CommonSessionControlModule } from '@common/redis/session';

import { GetLinkByIdHandler } from '@apps/links/src/application/handlers/get-link-by-id.handler';
import { GetLinksPaginatedHandler } from '@apps/links/src/application/handlers/get-links-paginated.handler';
import { UpdateLinkHandler } from '@apps/links/src/application/handlers/update-link.handler';
import { LinkService } from '@apps/links/src/application/services/link.service';
import { Link } from '@apps/links/src/domain/entities/link.entity';
import { LinksDatabaseModule } from '@apps/links/src/infrastructure/database/links-database.module';
import { LinksHealthController } from '@apps/links/src/links-healtz.controller';
import { LinksController } from '@apps/links/src/links.controller';

@Module({
  imports: [
    CommonConfigModule,
    CommonLoggerModule,
    CommonI18nModule,
    CommonCacheModule,
    CommonSessionControlModule,
    LinksDatabaseModule,
    TypeOrmModule.forFeature([Link]),
    CqrsModule,
  ],
  controllers: [LinksController, LinksHealthController],
  providers: [GetLinkByIdHandler, GetLinksPaginatedHandler, UpdateLinkHandler, LinkService],
})
export class LinksModule {}
