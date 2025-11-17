import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonConfigModule } from '@common/config';
import { JwtAuthGuard } from '@common/guards';
import { CommonI18nModule } from '@common/i18n';
import { CommonLoggerModule } from '@common/loggers';
import { CommonCacheModule } from '@common/redis/cache';
import { CommonSessionControlModule } from '@common/redis/session';
import { ApiResponseService } from '@common/responses';

import {
  LoginHandler,
  LogoutHandler,
  RefreshHandler,
  RegisterHandler,
} from '@apps/auth/src/application/handlers';
import { AuthService } from '@apps/auth/src/application/services/auth.service';
import { AuthController } from '@apps/auth/src/auth.controller';
import { User } from '@apps/auth/src/domain/entities/user.entity';
import { AuthDatabaseModule } from '@apps/auth/src/infrastructure/database/authDatabase.module';
import { JwtConfigService } from '@apps/auth/src/infrastructure/jwt/jwt-config.service';

import { HashService, UserService } from './application/services';
import { AuthHealthController } from './auth-healtz.controller';

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
  controllers: [AuthController, AuthHealthController],
  providers: [AuthService, HashService, LoginHandler, LogoutHandler, RefreshHandler, RegisterHandler, JwtConfigService, ApiResponseService, JwtAuthGuard, Logger, UserService],
})
export class AuthModule {}
