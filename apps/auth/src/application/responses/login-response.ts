import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  constructor(accessToken: string, refreshToken: string, csrfToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.csrfToken = csrfToken;
  }

  @ApiProperty()
  csrfToken: string;
}
