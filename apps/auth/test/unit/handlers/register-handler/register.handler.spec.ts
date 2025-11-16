import { hash as bcryptHash } from 'bcrypt';
import { mockDeep } from 'jest-mock-extended';
import { type Repository } from 'typeorm';

import { type CommonSessionControlService } from '@common/redis/session';
import { apiResponseFailure, apiResponseSuccess } from '@common/responses';
import { safeObjectContaining } from '@common/test/utils/safeObjectContaining.helper';
import { ErrorOnFactory } from '@common/types';

import { RegisterCommand } from '@apps/auth/src/application/commands';
import { RegisterHandler } from '@apps/auth/src/application/handlers';
import { TokenValidationHelper } from '@apps/auth/src/application/helpers';
import { type AuthService, type HashService } from '@apps/auth/src/application/services';
import { JwtPayload } from '@apps/auth/src/application/value-objects';
import { AuthErrorMessageConstants } from '@apps/auth/src/constants';
import { type User } from '@apps/auth/src/domain/entities';

import { RegisterHandlerFixture } from './register.handler.fixture';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
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

let handler: RegisterHandler;

describe('RegisterHandler', () => {
  let authService: jest.Mocked<AuthService>;
  let userRepository: jest.Mocked<Repository<User>>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };
  let commonSessionControlService: jest.Mocked<CommonSessionControlService>;
  let hashService: jest.Mocked<HashService>;

  beforeEach(() => {
    jest.clearAllMocks();

    authService = mockDeep<AuthService>();
    userRepository = mockDeep<Repository<User>>();
    i18nService = { translate: jest.fn(), t: jest.fn() };
    commonSessionControlService = mockDeep<CommonSessionControlService>();
    hashService = mockDeep<HashService>();

    handler = new RegisterHandler(
      userRepository,
      authService,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      i18nService as any,
      commonSessionControlService,
      hashService,
    );
  });

  it('can be constructed', () => {
    expect(
      () =>
        new RegisterHandler(
          userRepository,
          authService,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          i18nService as any,
          commonSessionControlService,
          hashService,
        ),
    ).not.toThrow();
  });

  it('returns failure when the email already exists', async () => {
    // Arrange
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RegisterHandlerFixture.emailExistsResponse());
    userRepository.findOne.mockResolvedValueOnce(RegisterHandlerFixture.existingUser());

    // Act
    const result = await handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()));

    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(
      i18nService,
      expect.arrayContaining([
        expect.objectContaining({
          message: RegisterHandlerFixture.emailExistsResponse().messageList![0].message,
        }),
      ]),
    );
    expect(result.success).toBe(false);
  });

  it('returns failure when creating payload fails', async () => {
    // Arrange
    userRepository.findOne.mockResolvedValueOnce(null);
    (bcryptHash as jest.Mock).mockResolvedValueOnce('hash');
    userRepository.save.mockResolvedValueOnce(RegisterHandlerFixture.createdUser());
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RegisterHandlerFixture.payloadErrorResponse());

    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValueOnce(ErrorOnFactory.error(AuthErrorMessageConstants.invalidUserId));

    // Act
    const result = await handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()));

    // Assert
    expect(spy).toHaveBeenCalledWith(RegisterHandlerFixture.createdUser().id, RegisterHandlerFixture.createdUser().email);
    expect(result.success).toBe(false);
    spy.mockRestore();
  });

  it('registers user, saves session and returns success', async () => {
    // Arrange
    userRepository.findOne.mockResolvedValueOnce(null);
    (bcryptHash as jest.Mock).mockResolvedValueOnce('hash');
    userRepository.save.mockResolvedValueOnce(RegisterHandlerFixture.createdUser());
    authService.generateTokens.mockResolvedValueOnce(RegisterHandlerFixture.validTokens());
    jest.mocked(apiResponseSuccess).mockResolvedValueOnce({
      success: true,
      data: RegisterHandlerFixture.validTokens(),
      messageList: [],
    });

    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValueOnce(ErrorOnFactory.success(RegisterHandlerFixture.mockJwtPayload(RegisterHandlerFixture.createdUser())));

    const sessionKey = RegisterHandlerFixture.sessionKey();
    commonSessionControlService.getUserSessionKey.mockReturnValue(sessionKey);

    const setSessionSpy = jest.spyOn(commonSessionControlService, 'setSession');
    const saveSpy = jest.spyOn(userRepository, 'save');

    // Act
    const result = await handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()));

    // Assert

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(apiResponseSuccess).toHaveBeenCalledWith(i18nService, RegisterHandlerFixture.validTokens());
    expect(setSessionSpy).toHaveBeenCalledWith(
      sessionKey,
      safeObjectContaining({
        userId: RegisterHandlerFixture.createdUser().id,
        sessionId: RegisterHandlerFixture.getValidJti(),
      }),
    );
    expect(result).toEqual({
      success: true,
      data: RegisterHandlerFixture.validTokens(),
      messageList: [],
    });

    spy.mockRestore();
  });

  it('should NOT save session if jti is not a valid UUID', async () => {
    // Arrange
    userRepository.findOne.mockResolvedValueOnce(null);
    (bcryptHash as jest.Mock).mockResolvedValueOnce('hash');
    userRepository.save.mockResolvedValueOnce(RegisterHandlerFixture.createdUser());
    authService.generateTokens.mockResolvedValueOnce(RegisterHandlerFixture.validTokens());
    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValueOnce(ErrorOnFactory.success(RegisterHandlerFixture.mockJwtPayload(RegisterHandlerFixture.createdUser())));
    const uuidSpy = jest.spyOn(TokenValidationHelper, 'validateUUID').mockResolvedValue({ isError: true, errorMessage: 'Invalid UUID' });

    const setSessionSpy = jest.spyOn(commonSessionControlService, 'setSession');

    // Act
    const result = await handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()));

    // Assert
    expect(setSessionSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);

    spy.mockRestore();
    uuidSpy.mockRestore();
  });

  it('should return success but not update lastLoginAt if accessToken or refreshToken is empty', async () => {
    // Arrange
    userRepository.findOne.mockResolvedValueOnce(null);
    (bcryptHash as jest.Mock).mockResolvedValueOnce('hash');
    userRepository.save.mockResolvedValueOnce(RegisterHandlerFixture.createdUser());
    const emptyTokens = RegisterHandlerFixture.emptyTokens();
    authService.generateTokens.mockResolvedValueOnce(emptyTokens);
    jest.mocked(apiResponseSuccess).mockResolvedValueOnce({
      success: true,
      data: emptyTokens,
      messageList: [],
    });

    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValueOnce(ErrorOnFactory.success(RegisterHandlerFixture.mockJwtPayload(RegisterHandlerFixture.createdUser())));

    const saveSpy = jest.spyOn(userRepository, 'save');

    // Act
    const result = await handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()));

    // Assert
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    expect(result.data?.accessToken).toBe('');

    spy.mockRestore();
  });

  it('should NOT update lastLoginAt if user.id is falsy (e.g. 0)', async () => {
    // Arrange
    const invalidUser = { ...RegisterHandlerFixture.createdUser(), id: 0 };
    userRepository.findOne.mockResolvedValueOnce(null);
    (bcryptHash as jest.Mock).mockResolvedValueOnce('hash');
    userRepository.save.mockResolvedValueOnce(invalidUser as User);
    authService.generateTokens.mockResolvedValueOnce(RegisterHandlerFixture.validTokens());

    const spy = jest
      .spyOn(JwtPayload, 'create')
      .mockReturnValueOnce(ErrorOnFactory.success(RegisterHandlerFixture.mockJwtPayload(invalidUser as User, RegisterHandlerFixture.getValidJti())));
    const saveSpy = jest.spyOn(userRepository, 'save');

    // Act
    const result = await handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()));

    // Assert
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);

    spy.mockRestore();
  });

  it('should return null if jti is empty', async () => {
    // Arrange
    const user = RegisterHandlerFixture.createdUser();

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
