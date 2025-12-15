import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CommonSessionControlService } from './common-session-control.service';
import { sessionControlConfigFactory } from './session-control.config';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: sessionControlConfigFactory,
    }),
  ],
  providers: [CommonSessionControlService, Logger],
  exports: [CommonSessionControlService],
})
export class CommonSessionControlModule {}
