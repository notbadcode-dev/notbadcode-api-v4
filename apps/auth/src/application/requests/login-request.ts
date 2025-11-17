import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

import { i18nMsg } from '@common/helpers';

import { AuthConstants, AuthErrorMessageConstants } from '@apps/auth/src/constants';

export class LoginRequest {
  @ApiProperty()
  @IsEmail({}, { message: AuthErrorMessageConstants.invalidEmail })
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(AuthConstants.userPasswordMinLength, {
    message: i18nMsg(AuthErrorMessageConstants.invalidLengthPassword, {
      min: AuthConstants.userPasswordMinLength,
    }),
  })
  password!: string;
}
