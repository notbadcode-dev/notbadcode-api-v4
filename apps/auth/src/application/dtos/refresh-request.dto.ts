import { ApiProperty } from '@nestjs/swagger';

export class RefreshRequestDto {
  @ApiProperty()
  accessToken: string;
}

