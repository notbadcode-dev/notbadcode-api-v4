import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonConfigModule } from '@common/config';
import { CommonI18nModule } from '@common/i18n';
import { CommonLoggerModule } from '@common/loggers';
import { CommonCacheModule } from '@common/redis/cache';
import { CommonSessionControlModule } from '@common/redis/session';
import { ApiResponseService } from '@common/responses';

import { LoginHandler } from 'apps/auth/src/application/handlers/login.handler';
import { AuthController } from 'apps/auth/src/auth.controller';
import { AuthService } from 'apps/auth/src/auth.service';
import { User } from 'apps/auth/src/domain/entities/user.entity';
import { AuthDatabaseModule } from 'apps/auth/src/infrastructure/database/authDatabase.module';
import { JwtConfigService } from 'apps/auth/src/infrastructure/jwt/jwt-config.service';

@Module({
  imports: [
    CommonConfigModule,
    CommonLoggerModule,
    CommonI18nModule,
    CommonCacheModule,
    CommonSessionControlModule,
    AuthDatabaseModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    CqrsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LoginHandler, JwtConfigService, ApiResponseService],
})
export class AuthModule {}
