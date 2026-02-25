import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { I18nLanguageInterceptor, I18nModule as NestI18nModule } from 'nestjs-i18n';

import { i18nConfig } from './i18n.config';
import { I18nService } from './i18n.service';

@Module({
  imports: [NestI18nModule.forRoot(i18nConfig)],
  providers: [
    I18nService,
    {
      provide: APP_INTERCEPTOR,
      useClass: I18nLanguageInterceptor,
    },
  ],
  exports: [NestI18nModule, I18nService],
})
export class CommonI18nModule {}
