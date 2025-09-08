import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogoutRequestDto {
  @ApiProperty()
  @IsString()
  accessToken!: string;
}
