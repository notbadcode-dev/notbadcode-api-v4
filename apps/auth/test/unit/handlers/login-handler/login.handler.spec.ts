/* eslint-disable @typescript-eslint/unbound-method */
import { compare as bcryptCompare } from 'bcrypt';
import { mockDeep } from 'jest-mock-extended';
import { type Repository } from 'typeorm';

import { type CommonSessionControlService } from '@common/redis/session';
import { apiResponseFailure, apiResponseSuccess, type ApiResponseService } from '@common/responses';
import { safeObjectContaining } from '@common/test/utils/safeObjectContaining.helper';

import { LoginCommand } from '@apps/auth/src/application/commands/login.command';
import { LoginHandler } from '@apps/auth/src/application/handlers/login.handler';
import { JwtPayload } from '@apps/auth/src/application/value-objects';
import { type AuthService } from '@apps/auth/src/auth.service';
import { type User } from '@apps/auth/src/domain/entities/user.entity';

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

  beforeEach(() => {
    jest.clearAllMocks();

    authService = mockDeep<AuthService>();
    userRepository = mockDeep<Repository<User>>();
    i18nService = { translate: jest.fn(), t: jest.fn() };
    apiResponseService = MockApiResponseService.create();
    commonSessionControlService = mockDeep<CommonSessionControlService>();

    handler = new LoginHandler(
      userRepository,
      authService,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      i18nService as any,
      apiResponseService,
      commonSessionControlService,
    );
  });

  it('returns failure when the user does not exist', async () => {
    // Arrange
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(LoginHandlerFixture.invalidCredentialsResponse());
    userRepository.findOne.mockResolvedValueOnce(null);

    // Act
    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.invalidEmail(), LoginHandlerFixture.invalidPassword()),
    );

    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(
      i18nService,
      expect.arrayContaining([
        expect.objectContaining({
          message: LoginHandlerFixture.invalidCredentialsResponse().messageList![0].message,
        }),
      ]),
    );
    expect(result.success).toBe(false);
  });

  it('returns failure when the password does not match', async () => {
    // Arrange
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(LoginHandlerFixture.invalidCredentialsResponse());
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
    (bcryptCompare as jest.Mock).mockResolvedValueOnce(false);

    // Act
    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.invalidPassword()),
    );

    // Assert
    expect(bcryptCompare).toHaveBeenCalledWith(
      LoginHandlerFixture.invalidPassword(),
      LoginHandlerFixture.validUser().passwordHash,
    );
    expect(apiResponseFailure).toHaveBeenCalledWith(
      i18nService,
      expect.arrayContaining([
        expect.objectContaining({
          message: LoginHandlerFixture.invalidCredentialsResponse().messageList![0].message,
        }),
      ]),
    );
    expect(result.success).toBe(false);
  });

  it('returns failure if JwtPayload.create fails', async () => {
    // Arrange
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(LoginHandlerFixture.payloadErrorResponse());
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
    (bcryptCompare as jest.Mock).mockResolvedValueOnce(true);
    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValue(LoginHandlerFixture.payloadErrorResponse());

    // Act
    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
    );

    // Assert
    expect(result.success).toBe(false);

    spy.mockRestore();
  });

  it('returns success with tokens when credentials are valid', async () => {
    // Arrange
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
    (bcryptCompare as jest.Mock).mockResolvedValueOnce(true);
    authService.generateTokens.mockResolvedValueOnce(LoginHandlerFixture.validTokens());
    jest.mocked(apiResponseSuccess).mockResolvedValueOnce({
      success: true,
      data: LoginHandlerFixture.validTokens(),
      messageList: [],
    });

    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValue({
      success: true,
      data: LoginHandlerFixture.mockJwtPayload(
        LoginHandlerFixture.validUser(),
        LoginHandlerFixture.getValidJti(),
      ),
    });

    const setSessionSpy = jest.spyOn(commonSessionControlService, 'setSession');
    commonSessionControlService.getUserSessionKey.mockReturnValue('mocked-session-key');

    // Act
    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
    );

    spy.mockRestore();

    // Assert

    const expectedWhere = safeObjectContaining({ email: LoginHandlerFixture.testEmail() }) as {
      email: string;
    };

    const expectedParam = safeObjectContaining({ where: expectedWhere }) as { where: { email: string } };

    expect(userRepository.findOne).toHaveBeenCalledWith(expectedParam);

    expect(bcryptCompare).toHaveBeenCalledWith(
      LoginHandlerFixture.testPassword(),
      LoginHandlerFixture.validUser().passwordHash,
    );
    expect(authService.generateTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: LoginHandlerFixture.validUser().id,
        email: LoginHandlerFixture.validUser().email,
      }),
    );
    expect(apiResponseSuccess).toHaveBeenCalledWith(i18nService, LoginHandlerFixture.validTokens());
    expect(setSessionSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        userId: LoginHandlerFixture.validUser().id,
        sessionId: LoginHandlerFixture.getValidJti(),
      }),
    );
    expect(result).toEqual({
      success: true,
      data: LoginHandlerFixture.validTokens(),
      messageList: [],
    });
  });
  it('should return success but not update lastLoginAt if accessToken or refreshToken is empty', async () => {
    // Arrange
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
    (bcryptCompare as jest.Mock).mockResolvedValueOnce(true);
    const emptyTokens = LoginHandlerFixture.emptyTokens();
    authService.generateTokens.mockResolvedValueOnce(emptyTokens);
    jest.mocked(apiResponseSuccess).mockResolvedValueOnce({
      success: true,
      data: emptyTokens,
      messageList: [],
    });

    const validJti = 'uuid-0000-0000-0000-000000000000';
    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValue({
      success: true,
      data: LoginHandlerFixture.mockJwtPayload(LoginHandlerFixture.validUser(), validJti),
    });
    const saveSpy = jest.spyOn(userRepository, 'save');

    // Act
    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
    );

    // Assert
    expect(saveSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data?.accessToken).toBe('');
    expect(result.data?.refreshToken).toBe('');

    spy.mockRestore();
  });

  it('should NOT save session if jti is not a valid UUID', async () => {
    // Arrange
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
    (bcryptCompare as jest.Mock).mockResolvedValueOnce(true);
    authService.generateTokens.mockResolvedValueOnce(LoginHandlerFixture.validTokens());
    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValue({
      success: true,
      data: LoginHandlerFixture.mockJwtPayload(
        LoginHandlerFixture.validUser(),
        LoginHandlerFixture.getInvalidJti(),
      ),
    });

    const setSessionSpy = jest.spyOn(commonSessionControlService, 'setSession');

    // Act
    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
    );

    // Assert
    expect(setSessionSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);

    spy.mockRestore();
  });

  it('should NOT update lastLoginAt if user.id is falsy (e.g. 0)', async () => {
    // Arrange
    const invalidUser = { ...LoginHandlerFixture.validUser(), id: 0 };
    userRepository.findOne.mockResolvedValueOnce(invalidUser as User);
    (bcryptCompare as jest.Mock).mockResolvedValueOnce(true);
    const tokens = LoginHandlerFixture.validTokens();
    authService.generateTokens.mockResolvedValueOnce(tokens);

    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValue({
      success: true,
      data: LoginHandlerFixture.mockJwtPayload(invalidUser as User, LoginHandlerFixture.getValidJti()),
    });
    const saveSpy = jest.spyOn(userRepository, 'save');

    // Act
    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
    );

    // Assert
    expect(saveSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);

    spy.mockRestore();
  });

  it('should return null if jti is empty', async () => {
    // Arrange
    const user = LoginHandlerFixture.validUser();

    // Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const resultEmpty = await (handler as any).setCacheSession(user, '');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const resultNull = await (handler as any).setCacheSession(user, null);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const resultUndefined = await (handler as any).setCacheSession(user, undefined);

    // Assert
    expect(resultEmpty).toBeNull();
    expect(resultNull).toBeNull();
    expect(resultUndefined).toBeNull();
  });
});
