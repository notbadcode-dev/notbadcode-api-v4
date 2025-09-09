/* eslint-disable @typescript-eslint/unbound-method */
import { mockDeep } from 'jest-mock-extended';
import { type Repository } from 'typeorm';

import { type CommonSessionControlService } from '@common/redis/session';
import { type ApiResponseService } from '@common/responses';

import { LoginCommand } from '@apps/auth/src/application/commands';
import { LoginHandler } from '@apps/auth/src/application/handlers';
import { type AuthService, type HashService } from '@apps/auth/src/application/services';
import { JwtPayload } from '@apps/auth/src/application/value-objects';
import { type User } from '@apps/auth/src/domain/entities';

import { MockApiResponseService } from '@test/utils/mocks/apiResponse.service.mock';

import { LoginHandlerFixture } from './login.handler.fixture';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('@common/responses', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = jest.requireActual<typeof import('@common/responses')>('@common/responses');

  const apiResponseSuccess = jest.fn(
    <T>(
      _i18n: Parameters<typeof actual.apiResponseSuccess>[0],
      data: T,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      messageList?: Parameters<typeof actual.apiResponseSuccess>[2],
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    ): Promise<import('@common/responses').ApiSuccessResponse<T>> =>
      Promise.resolve({
        success: true,
        data,
        messageList: messageList ?? [],
      }),
  ) as unknown as jest.MockedFunction<typeof actual.apiResponseSuccess>;

  const apiResponseFailure = jest.fn(
    (
      _i18n: Parameters<typeof actual.apiResponseFailure>[0],
      messages: Parameters<typeof actual.apiResponseFailure>[1],
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    ): Promise<import('@common/responses').ApiFailureResponse> =>
      Promise.resolve({
        success: false,
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        messageList: messages as import('@common/responses').ApiResponseMessage[],
      }),
  ) as unknown as jest.MockedFunction<typeof actual.apiResponseFailure>;

  return {
    ...actual,
    apiResponseSuccess,
    apiResponseFailure,
  };
});

let handler: LoginHandler;

describe('LoginHandler', () => {
  let authService: jest.Mocked<AuthService>;
  let userRepository: jest.Mocked<Repository<User>>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };
  let apiResponseService: jest.Mocked<ApiResponseService>;
  let commonSessionControlService: jest.Mocked<CommonSessionControlService>;
  let hashService: jest.Mocked<HashService>;

  beforeEach(() => {
    jest.clearAllMocks();

    authService = mockDeep<AuthService>();
    userRepository = mockDeep<Repository<User>>();
    i18nService = { translate: jest.fn(), t: jest.fn() };
    apiResponseService = MockApiResponseService.create();
    commonSessionControlService = mockDeep<CommonSessionControlService>();
    hashService = mockDeep<HashService>();

    handler = new LoginHandler(
      userRepository,
      authService,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      i18nService as any,
      apiResponseService,
      commonSessionControlService,
      hashService,
    );
  });

  it('can be constructed', () => {
    expect(() => {
      new LoginHandler(
        userRepository,
        authService,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        i18nService as any,
        apiResponseService,
        commonSessionControlService,
        hashService,
      );
    }).not.toThrow();
  });
  it('returns failure when the user does not exist', async () => {
    userRepository.findOne.mockResolvedValueOnce(null);

    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.invalidEmail(), LoginHandlerFixture.invalidPassword()),
    );

    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe('auth.error-message.invalidCredentials');
  });

it('returns failure when the password does not match', async () => {
  userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
  hashService.compare.mockResolvedValueOnce(false);

  const result = await handler.execute(
    new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.invalidPassword()),
  );

  expect(hashService.compare).toHaveBeenCalledWith(
    LoginHandlerFixture.invalidPassword(),
    LoginHandlerFixture.validUser().passwordHash,
  );
  expect(result.success).toBe(false);
  expect(result.messageList?.[0]?.message).toBe('auth.error-message.invalidCredentials');
});

it('returns failure if JwtPayload.create fails', async () => {
  userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
  hashService.compare.mockResolvedValueOnce(true);
  jest.spyOn(JwtPayload, 'create').mockReturnValue(LoginHandlerFixture.payloadErrorResponse());

  const result = await handler.execute(
    new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
  );

  expect(result.success).toBe(false);
});

  it('returns success with tokens when credentials are valid', async () => {
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
    hashService.compare.mockResolvedValueOnce(true);
    authService.generateTokens.mockResolvedValueOnce(LoginHandlerFixture.validTokens());
    jest.spyOn(JwtPayload, 'create').mockReturnValue({
      success: true,
      data: LoginHandlerFixture.mockJwtPayload(
        LoginHandlerFixture.validUser(),
        LoginHandlerFixture.getValidJti(),
      ),
    });

    commonSessionControlService.getUserSessionKey.mockReturnValue('mocked-session-key');
    const setSessionSpy = jest.spyOn(commonSessionControlService, 'setSession');
    const saveSpy = jest.spyOn(userRepository, 'save');

    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
    );

    expect(hashService.compare).toHaveBeenCalled();
    expect(authService.generateTokens).toHaveBeenCalled();
    expect(setSessionSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        userId: LoginHandlerFixture.validUser().id,
        sessionId: LoginHandlerFixture.getValidJti(),
      }),
    );
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(LoginHandlerFixture.validTokens());
  });

  it('should NOT update lastLoginAt if accessToken or refreshToken is empty', async () => {
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
    hashService.compare.mockResolvedValueOnce(true);
    const emptyTokens = LoginHandlerFixture.emptyTokens();
    authService.generateTokens.mockResolvedValueOnce(emptyTokens);
    jest.spyOn(JwtPayload, 'create').mockReturnValue({
      success: true,
      data: LoginHandlerFixture.mockJwtPayload(
        LoginHandlerFixture.validUser(),
        'uuid-0000-0000-0000-000000000000',
      ),
    });

    const saveSpy = jest.spyOn(userRepository, 'save');

    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
    );

    expect(saveSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data?.accessToken).toBe('');
    expect(result.data?.refreshToken).toBe('');
  });

  it('should NOT save session if jti is not a valid UUID', async () => {
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
    hashService.compare.mockResolvedValueOnce(true);
    authService.generateTokens.mockResolvedValueOnce(LoginHandlerFixture.validTokens());
    jest.spyOn(JwtPayload, 'create').mockReturnValue({
      success: true,
      data: LoginHandlerFixture.mockJwtPayload(
        LoginHandlerFixture.validUser(),
        LoginHandlerFixture.getInvalidJti(),
      ),
    });

    const setSessionSpy = jest.spyOn(commonSessionControlService, 'setSession');

    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
    );

    expect(setSessionSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should NOT update lastLoginAt if user.id is falsy (e.g. 0)', async () => {
    const invalidUser = { ...LoginHandlerFixture.validUser(), id: 0 };
    userRepository.findOne.mockResolvedValueOnce(invalidUser as User);
    hashService.compare.mockResolvedValueOnce(true);
    authService.generateTokens.mockResolvedValueOnce(LoginHandlerFixture.validTokens());
    jest.spyOn(JwtPayload, 'create').mockReturnValue({
      success: true,
      data: LoginHandlerFixture.mockJwtPayload(invalidUser as User, LoginHandlerFixture.getValidJti()),
    });

    const saveSpy = jest.spyOn(userRepository, 'save');

    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
    );

    expect(saveSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
