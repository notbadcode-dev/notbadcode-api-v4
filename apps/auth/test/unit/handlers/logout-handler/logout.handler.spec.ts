/* eslint-disable @typescript-eslint/unbound-method */
import { mockDeep } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';

import { type CommonSessionControlService } from '@common/redis/session';
import { apiResponseFailure, apiResponseSuccess } from '@common/responses';

import { LogoutCommand } from 'apps/auth/src/application/commands/logout.command';
import { LogoutHandler } from 'apps/auth/src/application/handlers/logout.handler';

import { LogoutHandlerFixture } from './logout.handler.fixture';

jest.mock('@common/responses', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = jest.requireActual<typeof import('@common/responses')>('@common/responses');

  const apiResponseSuccess = jest.fn(
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    async <T>(
      _i18n: Parameters<typeof actual.apiResponseSuccess>[0],
      data: T,
    ): Promise<import('@common/responses').ApiSuccessResponse<T>> => ({
      success: true,
      data,
      messageList: [],
    }),
  ) as unknown as jest.MockedFunction<typeof actual.apiResponseSuccess>;

  const apiResponseFailure = jest.fn(
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    async (
      _i18n: Parameters<typeof actual.apiResponseFailure>[0],
      messages?: Parameters<typeof actual.apiResponseFailure>[1],
    ): Promise<import('@common/responses').ApiFailureResponse> => ({
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

let handler: LogoutHandler;

describe('LogoutHandler', () => {
  let jwtService: jest.Mocked<JwtService>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };
  let commonSessionControlService: jest.Mocked<CommonSessionControlService>;

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService = mockDeep<JwtService>();
    i18nService = { translate: jest.fn(), t: jest.fn() };
    commonSessionControlService = mockDeep<CommonSessionControlService>();
    handler = new LogoutHandler(jwtService, i18nService as any, commonSessionControlService);
  });

  it('returns failure when token cannot be decoded', async () => {
    // Arrange
    jwtService.decode.mockReturnValueOnce(null);

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.invalidToken()));

    // Assert
    expect(apiResponseFailure).toHaveBeenCalled();
    expect(result.success).toBe(false);
  });

  it('deletes session and returns success when token is valid', async () => {
    // Arrange
    jwtService.decode.mockReturnValueOnce(LogoutHandlerFixture.decodedToken());
    commonSessionControlService.getUserSessionKey.mockReturnValueOnce('session-key');

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.testToken()));

    // Assert
    expect(commonSessionControlService.deleteSession).toHaveBeenCalledWith('session-key');
    expect(apiResponseSuccess).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
