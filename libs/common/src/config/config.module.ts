import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { envValidationSchema } from '@common/config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), 'apps/auth/.env')],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
  ],
})
export class ConfigModule {}
