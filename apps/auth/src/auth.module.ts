import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonCacheModule } from '@common/cache';
import { CommonConfigModule } from '@common/config';
import { CommonI18nModule } from '@common/i18n';
import { CommonLoggerModule } from '@common/loggers';
import { ApiResponseService } from '@common/responses';

import { LoginHandler } from './application/handlers/login.handler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './domain/entities/user.entity';
import { AuthDatabaseModule } from './infrastructure/database/authDatabase.module';
import { JwtConfigService } from './infrastructure/jwt/jwt-config.service';

@Module({
  imports: [
    CommonConfigModule,
    CommonLoggerModule,
    CommonI18nModule,
    CommonCacheModule,
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
