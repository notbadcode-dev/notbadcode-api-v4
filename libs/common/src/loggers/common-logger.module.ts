import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { RequestContextService } from '@common/context';
import { LoggingInterceptor } from '@common/interceptors';
import { loggerConfiguration } from '@common/loggers/';

@Module({
  imports: [WinstonModule.forRoot(loggerConfiguration())],
  providers: [LoggingInterceptor, RequestContextService],
  exports: [WinstonModule, LoggingInterceptor, RequestContextService],
})
export class CommonLoggerModule {}
