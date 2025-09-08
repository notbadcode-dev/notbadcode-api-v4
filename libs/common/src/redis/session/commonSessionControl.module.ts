import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CommonSessionControlService } from './commonSessionControl.service';
import { sessionControlConfigFactory } from './sessionControl.config';

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
