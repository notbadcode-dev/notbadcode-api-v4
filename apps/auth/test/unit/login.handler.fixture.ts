import { EApiResponseMessageType } from '@common/responses';

import { type User } from 'apps/auth/src/domain/entities/user.entity';

import { AuthErrorMessageConstants } from '../../src/constants';

export const testEmail = 'test@test.com';
export const testPassword = '123456';
export const invalidEmail = 'no@existe.com';
export const invalidPassword = 'pwd';

// Incluye todos los campos requeridos de la entidad User.
export const validUser: User = {
  id: 3,
  email: testEmail,
  passwordHash: 'hash',
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

export const validTokens = {
  accessToken: 'a',
  refreshToken: 'r',
};

export const invalidCredentialsResponse = {
  success: false as const,
  data: null,
  messageList: [{ message: AuthErrorMessageConstants.invalidCredentials }],
};

export const payloadErrorResponse = {
  success: false as const,
  data: null,
  messageList: [{ type: EApiResponseMessageType.Error, message: 'Error creando payload' }],
};
