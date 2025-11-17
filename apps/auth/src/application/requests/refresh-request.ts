import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshRequest {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
