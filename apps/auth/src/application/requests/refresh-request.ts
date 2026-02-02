import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { AuthErrorMessageConstants } from '@apps/auth/src/constants';

export class RefreshRequest {
  @ApiProperty({ description: 'JWT refresh token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString({ message: AuthErrorMessageConstants.invalidToken })
  @IsNotEmpty({ message: AuthErrorMessageConstants.invalidToken })
  refreshToken!: string;
}
