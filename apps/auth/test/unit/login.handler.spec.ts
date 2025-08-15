/* eslint-disable @typescript-eslint/unbound-method */
import { compare as bcryptCompare } from 'bcrypt';
import { mockDeep } from 'jest-mock-extended';
import { type Repository } from 'typeorm';

import { safeObjectContaining } from '@common/helpers';
import { apiResponseFailure, apiResponseSuccess, type ApiResponseService } from '@common/responses';

import { LoginCommand } from 'apps/auth/src/application/commands/login.command';
import { LoginHandler } from 'apps/auth/src/application/handlers/login.handler';
import { JwtPayload } from 'apps/auth/src/application/value-objects';
import { type AuthService } from 'apps/auth/src/auth.service';
import { type User } from 'apps/auth/src/domain/entities/user.entity';

import {
  invalidCredentialsResponse,
  invalidEmail,
  invalidPassword,
  payloadErrorResponse,
  testEmail,
  testPassword,
  validTokens,
  validUser,
} from './login.handler.fixture';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('@common/responses/apiResponse', () => ({
  apiResponseSuccess: jest.fn(async (_i18n: unknown, data: unknown) => ({
    success: true,
    data,
    messageList: [],
  })),
  apiResponseFailure: jest.fn(async (_i18n: unknown, messages: unknown[]) => ({
    success: false,
    messageList: messages,
  })),
}));

describe('LoginHandler', () => {
  let handler: LoginHandler;

  let authService: jest.Mocked<AuthService>;
  let userRepository: jest.Mocked<Repository<User>>;

  let i18nService: Record<string, jest.Mock>;

  let apiResponseService: jest.Mocked<ApiResponseService>;

  beforeEach(() => {
    jest.resetAllMocks();
    authService = mockDeep<AuthService>();
    userRepository = mockDeep<Repository<User>>();
    i18nService = { translate: jest.fn(), t: jest.fn() };
    apiResponseService = mockDeep<ApiResponseService>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    handler = new LoginHandler(userRepository, authService, i18nService as any, apiResponseService);
  });

  it('returns failure when the user does not exist', async () => {
    (apiResponseFailure as jest.Mock).mockResolvedValue(invalidCredentialsResponse);
    userRepository.findOne.mockResolvedValue(null);

    const result = await handler.execute(new LoginCommand(invalidEmail, invalidPassword));

    expect(apiResponseFailure).toHaveBeenCalledWith(
      i18nService,
      expect.arrayContaining([
        expect.objectContaining({ message: invalidCredentialsResponse.messageList[0].message }),
      ]),
    );
    expect(result.success).toBe(false);
  });

  it('returns failure when the password does not match', async () => {
    (apiResponseFailure as jest.Mock).mockResolvedValue(invalidCredentialsResponse);
    userRepository.findOne.mockResolvedValue(validUser);
    (bcryptCompare as jest.Mock).mockResolvedValue(false);

    const result = await handler.execute(new LoginCommand(testEmail, invalidPassword));

    expect(bcryptCompare).toHaveBeenCalledWith(invalidPassword, validUser.passwordHash);
    expect(apiResponseFailure).toHaveBeenCalledWith(
      i18nService,
      expect.arrayContaining([
        expect.objectContaining({ message: invalidCredentialsResponse.messageList[0].message }),
      ]),
    );
    expect(result.success).toBe(false);
  });

  it('returns failure if JwtPayload.create fails', async () => {
    (apiResponseFailure as jest.Mock).mockResolvedValue(payloadErrorResponse);
    userRepository.findOne.mockResolvedValue(validUser);
    (bcryptCompare as jest.Mock).mockResolvedValue(true);

    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValue(payloadErrorResponse);

    const result = await handler.execute(new LoginCommand(testEmail, testPassword));

    expect(result.success).toBe(false);

    spy.mockRestore();
  });

  it('returns success with tokens when credentials are valid', async () => {
    userRepository.findOne.mockResolvedValue(validUser);
    (bcryptCompare as jest.Mock).mockResolvedValue(true);
    authService.generateTokens.mockResolvedValue(validTokens);
    (apiResponseSuccess as jest.Mock).mockResolvedValue({
      success: true,
      data: validTokens,
      messageList: [],
    });

    const mockJwtPayload: JwtPayload = {
      userId: validUser.id,
      email: validUser.email,
      toPlainObject: () => ({ sub: validUser.id, email: validUser.email }),
    };
    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValue({
      success: true,
      data: mockJwtPayload,
    });
    const result = await handler.execute(new LoginCommand(testEmail, testPassword));
    spy.mockRestore();

    const expectedWhere = safeObjectContaining({ email: testEmail });
    const expectedParam = safeObjectContaining({ where: expectedWhere });
    expect(userRepository.findOne).toHaveBeenCalledWith(expectedParam);

    expect(bcryptCompare).toHaveBeenCalledWith(testPassword, validUser.passwordHash);
    expect(authService.generateTokens).toHaveBeenCalledWith(
      expect.objectContaining({ userId: validUser.id, email: validUser.email }),
    );
    expect(apiResponseSuccess).toHaveBeenCalledWith(i18nService, validTokens);
    expect(result).toEqual({ success: true, data: validTokens, messageList: [] });
  });
});
