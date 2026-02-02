import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { i18nMsg } from '@common/helpers';

import { AuthConstants, AuthErrorMessageConstants } from '@apps/auth/src/constants';

export class AuthCredentialsRequest {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail({}, { message: AuthErrorMessageConstants.invalidEmail })
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'mySecurePass123',
    minLength: AuthConstants.userPasswordMinLength,
    maxLength: AuthConstants.userPasswordMaxLength,
  })
  @IsString()
  @MinLength(AuthConstants.userPasswordMinLength, {
    message: i18nMsg(AuthErrorMessageConstants.invalidLengthPassword, {
      min: AuthConstants.userPasswordMinLength,
    }),
  })
  @MaxLength(AuthConstants.userPasswordMaxLength, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    message: i18nMsg(AuthErrorMessageConstants.invalidMaxLengthPassword, {
      max: AuthConstants.userPasswordMaxLength,
    }),
  })
  password!: string;
}
