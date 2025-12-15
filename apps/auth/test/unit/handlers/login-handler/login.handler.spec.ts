/* eslint-disable @typescript-eslint/unbound-method */
import { mockDeep } from 'jest-mock-extended';
import { type Repository } from 'typeorm';

import { type CommonSessionControlService } from '@common/redis/session';
import { ErrorOnFactory } from '@common/types/error-on.type';

import { LoginCommand } from '@apps/auth/src/application/commands';
import { LoginHandler } from '@apps/auth/src/application/handlers';
import { type AuthService, type HashService } from '@apps/auth/src/application/services';
import { JwtPayload } from '@apps/auth/src/application/value-objects';
import { AuthErrorMessageConstants } from '@apps/auth/src/constants';
import { type User } from '@apps/auth/src/domain/entities';

import { LoginHandlerFixture } from './login.handler.fixture';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

let handler: LoginHandler;

describe('LoginHandler', () => {
  let authService: jest.Mocked<AuthService>;
  let userRepository: jest.Mocked<Repository<User>>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };
  let commonSessionControlService: jest.Mocked<CommonSessionControlService>;
  let hashService: jest.Mocked<HashService>;
  let userService: { getUserSessionWithDate: jest.Mock; getUserSessions: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    authService = mockDeep<AuthService>();
    userRepository = mockDeep<Repository<User>>();
    i18nService = { translate: jest.fn(), t: jest.fn() };
    commonSessionControlService = mockDeep<CommonSessionControlService>();
    hashService = mockDeep<HashService>();
    userService = {
      getUserSessionWithDate: jest.fn(),
      getUserSessions: jest.fn(),
    };

    handler = new LoginHandler(
      userRepository,
      authService,
      commonSessionControlService,
      hashService,
      userService,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      i18nService as any,
    );
  });

  it('can be constructed', () => {
    expect(() => {
      new LoginHandler(
        userRepository,
        authService,
        commonSessionControlService,
        hashService,
        userService,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        i18nService as any,
      );
    }).not.toThrow();
  });
  it('returns failure when the user does not exist', async () => {
    userRepository.findOne.mockResolvedValueOnce(null);

    const result = await handler.execute(new LoginCommand(LoginHandlerFixture.invalidEmail(), LoginHandlerFixture.invalidPassword()));

    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(AuthErrorMessageConstants.invalidCredentials);
  });

  it('returns failure when the password does not match', async () => {
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.existingUser());
    hashService.compare.mockResolvedValueOnce(false);

    const result = await handler.execute(new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.invalidPassword()));

    expect(hashService.compare).toHaveBeenCalledWith(LoginHandlerFixture.invalidPassword(), LoginHandlerFixture.existingUser().passwordHash);
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(AuthErrorMessageConstants.invalidCredentials);
  });

  it('returns failure if JwtPayload.create fails', async () => {
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.existingUser());
    hashService.compare.mockResolvedValueOnce(true);
    jest.spyOn(JwtPayload, 'create').mockReturnValue(ErrorOnFactory.error(AuthErrorMessageConstants.invalidUserId));

    const result = await handler.execute(new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()));

    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(AuthErrorMessageConstants.invalidUserId);
  });

  it('returns success with tokens when credentials are valid', async () => {
    userService.getUserSessionWithDate.mockReturnValue(LoginHandlerFixture.getUserSessionWithDate());
    userService.getUserSessionWithDate = jest.fn().mockReturnValue(LoginHandlerFixture.getUserSessionWithDate());
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.existingUser());
    hashService.compare.mockResolvedValueOnce(true);
    authService.generateTokens.mockResolvedValueOnce(LoginHandlerFixture.validTokens());
    jest.spyOn(JwtPayload, 'create').mockReturnValue(ErrorOnFactory.success(LoginHandlerFixture.mockJwtPayload()));

    commonSessionControlService.getUserSessionKey.mockReturnValue(LoginHandlerFixture.getValidJti());
    const setSessionSpy = jest.spyOn(commonSessionControlService, 'setSession');
    const saveSpy = jest.spyOn(userRepository, 'save');

    const result = await handler.execute(new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()));

    expect(hashService.compare).toHaveBeenCalled();
    expect(authService.generateTokens).toHaveBeenCalled();
    expect(setSessionSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        userId: LoginHandlerFixture.existingUser().id,
        sessionId: LoginHandlerFixture.getValidJti(),
      }),
    );
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(LoginHandlerFixture.validTokens());
  });

  it('should NOT update lastLoginAt if accessToken or refreshToken is empty', async () => {
    userService.getUserSessionWithDate.mockReturnValue(LoginHandlerFixture.getUserSessionWithDate());
    userService.getUserSessionWithDate = jest.fn().mockReturnValue(LoginHandlerFixture.getUserSessionWithDate());
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.existingUser());
    hashService.compare.mockResolvedValueOnce(true);
    const emptyTokens = LoginHandlerFixture.emptyTokens();
    authService.generateTokens.mockResolvedValueOnce(emptyTokens);
    jest.spyOn(JwtPayload, 'create').mockReturnValue(ErrorOnFactory.success(LoginHandlerFixture.mockJwtPayload()));

    const saveSpy = jest.spyOn(userRepository, 'save');

    const result = await handler.execute(new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()));

    expect(saveSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data?.accessToken).toBe('');
    expect(result.data?.refreshToken).toBe('');
  });

  it('should NOT update lastLoginAt if refreshToken is empty', async () => {
    userService.getUserSessionWithDate.mockReturnValue(LoginHandlerFixture.getUserSessionWithDate());
    userService.getUserSessionWithDate = jest.fn().mockReturnValue(LoginHandlerFixture.getUserSessionWithDate());
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.existingUser());
    hashService.compare.mockResolvedValueOnce(true);
    const partialTokens = { accessToken: 'token', refreshToken: '' };
    authService.generateTokens.mockResolvedValueOnce(partialTokens);
    jest.spyOn(JwtPayload, 'create').mockReturnValue(ErrorOnFactory.success(LoginHandlerFixture.mockJwtPayload()));

    const saveSpy = jest.spyOn(userRepository, 'save');

    const result = await handler.execute(new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()));

    expect(saveSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data?.refreshToken).toBe('');
  });

  it('should NOT save session if jti is not a valid UUID', async () => {
    userService.getUserSessionWithDate.mockReturnValue(LoginHandlerFixture.getUserSessionWithDate());
    userService.getUserSessionWithDate = jest.fn().mockReturnValue(LoginHandlerFixture.getUserSessionWithDate());
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.existingUser());
    hashService.compare.mockResolvedValueOnce(true);
    authService.generateTokens.mockResolvedValueOnce(LoginHandlerFixture.validTokens());
    jest.spyOn(JwtPayload, 'create').mockReturnValue(ErrorOnFactory.success(LoginHandlerFixture.mockJwtPayloadWithInvalidJti()));

    const setSessionSpy = jest.spyOn(commonSessionControlService, 'setSession');

    const result = await handler.execute(new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()));

    expect(setSessionSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should NOT update lastLoginAt if user.id is falsy (e.g. 0)', async () => {
    userService.getUserSessionWithDate.mockReturnValue(LoginHandlerFixture.getUserSessionWithDate());
    userService.getUserSessionWithDate = jest.fn().mockReturnValue(LoginHandlerFixture.getUserSessionWithDate());
    const invalidUser = { ...LoginHandlerFixture.existingUser(), id: 0 };
    userRepository.findOne.mockResolvedValueOnce(invalidUser as User);
    hashService.compare.mockResolvedValueOnce(true);
    authService.generateTokens.mockResolvedValueOnce(LoginHandlerFixture.validTokens());
    jest.spyOn(JwtPayload, 'create').mockReturnValue(ErrorOnFactory.success(LoginHandlerFixture.mockJwtPayload()));

    const saveSpy = jest.spyOn(userRepository, 'save');

    const result = await handler.execute(new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()));

    expect(saveSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
