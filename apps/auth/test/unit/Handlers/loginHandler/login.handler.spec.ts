/* eslint-disable @typescript-eslint/unbound-method */
import { compare as bcryptCompare } from 'bcrypt';
import { mockDeep } from 'jest-mock-extended';
import { type Repository } from 'typeorm';

import { safeObjectContaining } from '@common/helpers';
import { apiResponseFailure, apiResponseSuccess, type ApiResponseService } from '@common/responses';

import { LoginCommand } from 'apps/auth/src/application/commands/login.command';
import { LoginResponseDto } from 'apps/auth/src/application/dtos';
import { LoginHandler } from 'apps/auth/src/application/handlers/login.handler';
import { JwtPayload } from 'apps/auth/src/application/value-objects';
import { type AuthService } from 'apps/auth/src/auth.service';
import { type User } from 'apps/auth/src/domain/entities/user.entity';
import { MockApiResponseService } from 'apps/auth/test/utils/mocks/apiResponse.service.mock';

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

class LoginHandlerSpecFixture {
  static mockJwtPayload(user: User): JwtPayload {
    return {
      userId: user.id,
      email: user.email,
      toPlainObject: () => ({
        sub: user.id,
        email: user.email,
      }),
    };
  }

  static emptyTokens(): LoginResponseDto {
    return new LoginResponseDto('', '');
  }
}

let handler: LoginHandler;

describe('LoginHandler', () => {
  let authService: jest.Mocked<AuthService>;
  let userRepository: jest.Mocked<Repository<User>>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };
  let apiResponseService: jest.Mocked<ApiResponseService>;

  beforeEach(() => {
    jest.clearAllMocks();

    authService = mockDeep<AuthService>();
    userRepository = mockDeep<Repository<User>>();
    i18nService = { translate: jest.fn(), t: jest.fn() };
    apiResponseService = MockApiResponseService.create();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    handler = new LoginHandler(userRepository, authService, i18nService as any, apiResponseService);
  });

  it('returns failure when the user does not exist', async () => {
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(LoginHandlerFixture.invalidCredentialsResponse());

    userRepository.findOne.mockResolvedValueOnce(null);

    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.invalidEmail(), LoginHandlerFixture.invalidPassword()),
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

  it('returns failure when the password does not match', async () => {
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(LoginHandlerFixture.invalidCredentialsResponse());

    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
    (bcryptCompare as jest.Mock).mockResolvedValueOnce(false);

    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.invalidPassword()),
    );

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
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(LoginHandlerFixture.payloadErrorResponse());

    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
    (bcryptCompare as jest.Mock).mockResolvedValueOnce(true);

    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValue(LoginHandlerFixture.payloadErrorResponse());

    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
    );

    expect(result.success).toBe(false);

    spy.mockRestore();
  });

  it('returns success with tokens when credentials are valid', async () => {
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
      data: LoginHandlerSpecFixture.mockJwtPayload(LoginHandlerFixture.validUser()),
    });

    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
    );

    spy.mockRestore();

    const expectedWhere = safeObjectContaining({ email: LoginHandlerFixture.testEmail() });
    const expectedParam = safeObjectContaining({ where: expectedWhere });
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
    expect(result).toEqual({
      success: true,
      data: LoginHandlerFixture.validTokens(),
      messageList: [],
    });
  });

  it('should return success but not update lastLoginAt if accessToken or refreshToken is empty', async () => {
    userRepository.findOne.mockResolvedValueOnce(LoginHandlerFixture.validUser());
    (bcryptCompare as jest.Mock).mockResolvedValueOnce(true);

    const emptyTokens = LoginHandlerSpecFixture.emptyTokens();
    authService.generateTokens.mockResolvedValueOnce(emptyTokens);

    jest.mocked(apiResponseSuccess).mockResolvedValueOnce({
      success: true,
      data: emptyTokens,
      messageList: [],
    });

    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValue({
      success: true,
      data: LoginHandlerSpecFixture.mockJwtPayload(LoginHandlerFixture.validUser()),
    });

    const saveSpy = jest.spyOn(userRepository, 'save');

    const result = await handler.execute(
      new LoginCommand(LoginHandlerFixture.testEmail(), LoginHandlerFixture.testPassword()),
    );

    expect(saveSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data?.accessToken).toBe('');
    expect(result.data?.refreshToken).toBe('');

    spy.mockRestore();
  });
});
