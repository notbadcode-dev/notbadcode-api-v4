import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { LoggingInterceptor } from '@common/interceptors';
import { loggerConfiguration } from '@common/loggers/';

@Module({
  imports: [WinstonModule.forRoot(loggerConfiguration())],
  providers: [LoggingInterceptor],
  exports: [WinstonModule, LoggingInterceptor],
})
export class CommonLoggerModule {}
