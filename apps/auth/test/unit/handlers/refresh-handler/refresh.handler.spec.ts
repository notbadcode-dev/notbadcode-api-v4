/* eslint-disable @typescript-eslint/no-magic-numbers */
import { type UUID } from 'crypto';

import { type Logger } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';

import { EJwtType } from '@common/auth';
import { type CommonSessionControlService } from '@common/redis/session';
import { apiResponseFailure, apiResponseSuccess } from '@common/responses';
import { type ErrorOn, ErrorOnFactory } from '@common/types/errorOn.type';

import { RefreshCommand } from '@apps/auth/src/application/commands';
import { RefreshHandler } from '@apps/auth/src/application/handlers';
import { type AuthService } from '@apps/auth/src/application/services';
import { JwtPayload } from '@apps/auth/src/application/value-objects';
import { AuthErrorMessageConstants } from '@apps/auth/src/constants';

import { RefreshHandlerFixture } from './refresh.handler.fixture';

jest.mock('@common/responses', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = jest.requireActual<typeof import('@common/responses')>('@common/responses');

  const apiResponseSuccess = jest.fn(
    <T>(
      _i18n: Parameters<typeof actual.apiResponseSuccess>[0],
      data: T,
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

describe('RefreshHandler', () => {
  let handler: RefreshHandler;
  let authService: jest.Mocked<AuthService>;
  let jwtService: { verify: jest.Mock };
  let i18nService: { translate: jest.Mock; t: jest.Mock };
  let commonSessionControlService: jest.Mocked<CommonSessionControlService>;
  let logger: jest.Mocked<Logger>;

  beforeEach(() => {
    jest.clearAllMocks();

    authService = mockDeep<AuthService>();
    jwtService = { verify: jest.fn() };
    i18nService = { translate: jest.fn(), t: jest.fn() };
    commonSessionControlService = mockDeep<CommonSessionControlService>();
    logger = mockDeep<Logger>();

    handler = new RefreshHandler(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jwtService as any,
      authService,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      i18nService as any,
      commonSessionControlService,
      logger,
    );
  });

  it('can be constructed', () => {
    expect(
      () =>
        new RefreshHandler(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          jwtService as any,
          authService,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          i18nService as any,
          commonSessionControlService,
          logger,
        ),
    ).not.toThrow();
  });

  it('returns failure when token is invalid', async () => {
    // Arrange
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RefreshHandlerFixture.invalidTokenResponse());
    jwtService.verify.mockImplementationOnce(() => {
      throw new Error('invalid');
    });

    // Act
    const result = await handler.execute(new RefreshCommand(RefreshHandlerFixture.validTokens().accessToken));

    // Assert
    expect(jwtService.verify).toHaveBeenCalledWith(RefreshHandlerFixture.validTokens().accessToken);
    expect(apiResponseFailure).toHaveBeenCalled();
    expect(result.success).toBe(false);
  });

  it('returns failure when token is empty', async () => {
    // Arrange
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RefreshHandlerFixture.invalidTokenResponse());

    // Act
    const result = await handler.execute(new RefreshCommand('   '));

    // Assert
    expect(apiResponseFailure).toHaveBeenCalled();
    expect(result.success).toBe(false);
  });

  it('returns failure when payload is missing fields', async () => {
    // Arrange
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RefreshHandlerFixture.invalidTokenResponse());
    jwtService.verify.mockReturnValueOnce({ sub: undefined, email: undefined });

    // Act
    const result = await handler.execute(new RefreshCommand(RefreshHandlerFixture.validTokens().accessToken));

    // Assert
    expect(apiResponseFailure).toHaveBeenCalled();
    expect(result.success).toBe(false);
  });

  it('returns failure when jti is invalid', async () => {
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RefreshHandlerFixture.invalidSessionIdResponse());
    jwtService.verify.mockReturnValueOnce({
      sub: 1,
      email: RefreshHandlerFixture.testEmail(),
      jti: 'not-a-uuid',
      tokenType: EJwtType.REFRESH,
    });

    const result = await handler.execute(new RefreshCommand(RefreshHandlerFixture.validTokens().accessToken));

    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, RefreshHandlerFixture.invalidSessionIdResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure when session is not active', async () => {
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RefreshHandlerFixture.sessionNotActiveResponse());
    jwtService.verify.mockReturnValueOnce({
      sub: 1,
      email: RefreshHandlerFixture.testEmail(),
      jti: RefreshHandlerFixture.getValidUUID(),
      tokenType: EJwtType.REFRESH,
    });
    commonSessionControlService.getUserSessionKey.mockReturnValue(RefreshHandlerFixture.getUserSessionKey());
    commonSessionControlService.getSession.mockResolvedValueOnce(null);

    const result = await handler.execute(new RefreshCommand(RefreshHandlerFixture.validTokens().accessToken));

    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, RefreshHandlerFixture.sessionNotActiveResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns success with tokens when everything is valid', async () => {
    jwtService.verify.mockReturnValueOnce({
      sub: 1,
      email: RefreshHandlerFixture.testEmail(),
      jti: RefreshHandlerFixture.getValidUUID(),
      tokenType: EJwtType.REFRESH,
    });
    commonSessionControlService.getUserSessionKey.mockReturnValue(RefreshHandlerFixture.getUserSessionKey());
    commonSessionControlService.getSession.mockResolvedValueOnce({
      userId: 1,
      sessionId: RefreshHandlerFixture.getValidUUID() as UUID,
    });
    authService.generateTokens.mockResolvedValueOnce(RefreshHandlerFixture.validTokens());

    jest.mocked(apiResponseSuccess).mockResolvedValueOnce({
      success: true,
      data: RefreshHandlerFixture.validTokens(),
      messageList: [],
    });

    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValueOnce(ErrorOnFactory.success(RefreshHandlerFixture.mockJwtPayload());

    const result = await handler.execute(new RefreshCommand(RefreshHandlerFixture.validTokens().accessToken));

    spy.mockRestore();
    expect(apiResponseSuccess).toHaveBeenCalledWith(i18nService, RefreshHandlerFixture.validTokens());
    expect(result).toEqual({
      success: true,
      data: RefreshHandlerFixture.validTokens(),
      messageList: [],
    });
  });

  it('returns failure when jwtService.verify returns null (payload falsy)', async () => {
    // Arrange
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RefreshHandlerFixture.invalidTokenResponse());
    jwtService.verify.mockReturnValueOnce(null);

    // Act
    const result = await handler.execute(new RefreshCommand(RefreshHandlerFixture.validTokens().accessToken));

    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, RefreshHandlerFixture.invalidTokenResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('logs and returns failure if jwtService.verify throws a non-Error', async () => {
    // Arrange
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RefreshHandlerFixture.invalidTokenResponse());
    const errorMessage = 'some string error';

    jwtService.verify.mockImplementationOnce(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw errorMessage;
    });

    // Act
    const result = await handler.execute(new RefreshCommand(RefreshHandlerFixture.validTokens().accessToken));

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(logger.error).toHaveBeenCalledWith(expect.any(String), expect.stringContaining(errorMessage));
    expect(result.success).toBe(false);
    expect(result).toEqual(RefreshHandlerFixture.invalidTokenResponse());
  });

  it('returns failure when tokenType is not "refresh"', async () => {
    // Arrange
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RefreshHandlerFixture.invalidTokenResponse());
    jwtService.verify.mockReturnValueOnce({
      sub: 1,
      email: RefreshHandlerFixture.testEmail(),
      jti: RefreshHandlerFixture.getValidUUID(),
      tokenType: 'access', // ¡No es refresh!
    });

    // Act
    const result = await handler.execute(new RefreshCommand(RefreshHandlerFixture.validTokens().accessToken));

    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, RefreshHandlerFixture.invalidTokenResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure when tokenType is missing', async () => {
    // Arrange
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RefreshHandlerFixture.invalidTokenResponse());
    jwtService.verify.mockReturnValueOnce({
      sub: 1,
      email: RefreshHandlerFixture.testEmail(),
      jti: RefreshHandlerFixture.getValidUUID(),
      // Sin tokenType
    });

    // Act
    const result = await handler.execute(new RefreshCommand(RefreshHandlerFixture.validTokens().accessToken));

    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, RefreshHandlerFixture.invalidTokenResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('calls setSession with refreshed session on success', async () => {
    // Arrange
    const validPayload = {
      sub: 1,
      email: RefreshHandlerFixture.testEmail(),
      jti: RefreshHandlerFixture.getValidUUID(),
      tokenType: EJwtType.REFRESH,
    };
    jwtService.verify.mockReturnValueOnce(validPayload);
    commonSessionControlService.getUserSessionKey.mockReturnValue(RefreshHandlerFixture.getUserSessionKey());
    commonSessionControlService.getSession.mockResolvedValueOnce({
      userId: 1,
      sessionId: RefreshHandlerFixture.getValidUUID() as UUID,
    });
    commonSessionControlService.setSession.mockResolvedValueOnce(Promise.resolve(null));
    authService.generateTokens.mockResolvedValueOnce(RefreshHandlerFixture.validTokens());
    jest.mocked(apiResponseSuccess).mockResolvedValueOnce({
      success: true,
      data: RefreshHandlerFixture.validTokens(),
      messageList: [],
    });
    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValueOnce(ErrorOnFactory.success(RefreshHandlerFixture.mockJwtPayload()));

    // Act
    await handler.execute(new RefreshCommand(RefreshHandlerFixture.validTokens().accessToken));

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(commonSessionControlService.setSession).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('returns failure when JwtPayload.create fails', async () => {
    // Arrange
    const expectedResponse = {
      isError: true,
      errorMessage: AuthErrorMessageConstants.invalidToken,
    };
    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValue(expectedResponse as ErrorOn<JwtPayload>);

    jwtService.verify.mockReturnValueOnce({
      sub: 1,
      email: RefreshHandlerFixture.testEmail(),
      jti: RefreshHandlerFixture.getValidUUID(),
      tokenType: EJwtType.REFRESH,
    });

    commonSessionControlService.getUserSessionKey.mockReturnValue(RefreshHandlerFixture.getUserSessionKey());
    commonSessionControlService.getSession.mockResolvedValueOnce({
      userId: 1,
      sessionId: RefreshHandlerFixture.getValidUUID() as UUID,
    });

    // Act
    const result = await handler.execute(new RefreshCommand(RefreshHandlerFixture.validTokens().accessToken));

    // Assert
    expect(result.messageList?.map((msg) => msg.message)).toContainEqual(expectedResponse.errorMessage);
    spy.mockRestore();
  });
});
