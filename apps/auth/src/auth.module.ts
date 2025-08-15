import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@common/config';
import { CommonI18nModule } from '@common/i18n';
import { LoggerModule } from '@common/loggers';
import { ApiResponseService } from '@common/responses';

import { LoginHandler } from './application/handlers/login.handler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './domain/entities/user.entity';
import { DatabaseModule } from './infrastructure/database/database.module';
import { JwtConfigService } from './infrastructure/jwt/jwt-config.service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    CommonI18nModule,
    CqrsModule,
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LoginHandler, JwtConfigService, ApiResponseService],
})
export class AuthModule {}
