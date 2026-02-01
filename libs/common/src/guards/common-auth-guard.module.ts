import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtConfigService } from './jwt-config.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
  ],
  providers: [JwtAuthGuard, JwtConfigService],
  exports: [JwtAuthGuard, JwtModule],
})
export class CommonAuthGuardModule {}
