/* eslint-disable @typescript-eslint/unbound-method */
import { mockDeep } from 'jest-mock-extended';

import { type CommonSessionControlService } from '@common/redis/session';
import { apiResponseFailure, apiResponseSuccess, type ApiResponseService } from '@common/responses';

import { MockApiResponseService } from '@test/utils/mocks/apiResponse.service.mock';
import { RefreshCommand } from 'apps/auth/src/application/commands/refresh.command';
import { RefreshHandler } from 'apps/auth/src/application/handlers/refresh.handler';
import { JwtPayload } from 'apps/auth/src/application/value-objects';
import { type AuthService } from 'apps/auth/src/auth.service';

import { RefreshHandlerFixture } from './refresh.handler.fixture';

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

describe('RefreshHandler', () => {
  let handler: RefreshHandler;
  let authService: jest.Mocked<AuthService>;
  let jwtService: { verifyAsync: jest.Mock };
  let i18nService: { translate: jest.Mock; t: jest.Mock };
  let apiResponseService: jest.Mocked<ApiResponseService>;
  let commonSessionControlService: jest.Mocked<CommonSessionControlService>;

  beforeEach(() => {
    jest.clearAllMocks();

    authService = mockDeep<AuthService>();
    jwtService = { verifyAsync: jest.fn() };
    i18nService = { translate: jest.fn(), t: jest.fn() };
    apiResponseService = MockApiResponseService.create();
    commonSessionControlService = mockDeep<CommonSessionControlService>();

    handler = new RefreshHandler(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jwtService as any,
      authService,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      i18nService as any,
      apiResponseService,
      commonSessionControlService,
    );
  });

  it('returns failure when token is invalid', async () => {
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RefreshHandlerFixture.invalidTokenResponse());

    jwtService.verifyAsync.mockRejectedValueOnce(new Error('invalid'));

    const result = await handler.execute(new RefreshCommand(RefreshHandlerFixture.accessToken()));

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(RefreshHandlerFixture.accessToken());
    expect(apiResponseFailure).toHaveBeenCalled();
    expect(result.success).toBe(false);
  });

  it('returns success with tokens when token is valid', async () => {
    jwtService.verifyAsync.mockResolvedValueOnce(RefreshHandlerFixture.decoded());
    authService.generateTokens.mockResolvedValueOnce(RefreshHandlerFixture.validTokens());

    jest.mocked(apiResponseSuccess).mockResolvedValueOnce({
      success: true,
      data: RefreshHandlerFixture.validTokens(),
      messageList: [],
    });

    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValue({
      success: true,
      data: RefreshHandlerFixture.mockJwtPayload(),
    });

    const result = await handler.execute(new RefreshCommand(RefreshHandlerFixture.accessToken()));

    spy.mockRestore();

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(RefreshHandlerFixture.accessToken());
    expect(authService.generateTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: RefreshHandlerFixture.mockJwtPayload().userId,
        email: RefreshHandlerFixture.mockJwtPayload().email,
      }),
    );
    expect(apiResponseSuccess).toHaveBeenCalledWith(i18nService, RefreshHandlerFixture.validTokens());
    expect(result).toEqual({
      success: true,
      data: RefreshHandlerFixture.validTokens(),
      messageList: [],
    });
  });
});

