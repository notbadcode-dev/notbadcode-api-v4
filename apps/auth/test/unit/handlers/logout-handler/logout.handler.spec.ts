/* eslint-disable @typescript-eslint/no-magic-numbers */
import { type Logger } from '@nestjs/common';
import { type JwtService } from '@nestjs/jwt';
import { mockDeep } from 'jest-mock-extended';
import { type Repository } from 'typeorm';

import { type CommonSessionControlService } from '@common/redis/session';
import { apiResponseFailure, apiResponseSuccess, type ApiResponseMessage } from '@common/responses';

import { LogoutCommand } from '@apps/auth/src/application/commands';
import { LogoutHandler } from '@apps/auth/src/application/handlers/logout.handler';
import { type User } from '@apps/auth/src/domain/entities';

import { LogoutHandlerFixture } from './logout.handler.fixture';

jest.mock('@common/responses', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = jest.requireActual<typeof import('@common/responses')>('@common/responses');
  return {
    ...actual,
    apiResponseSuccess: jest.fn((_i18n, data) =>
      Promise.resolve({
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data,
        messageList: [],
      }),
    ),
    apiResponseFailure: jest.fn((_i18n, messages) =>
      Promise.resolve({
        success: false,
        messageList: messages as ApiResponseMessage[],
      }),
    ),
  };
});

describe('LogoutHandler', () => {
  let jwtService: jest.Mocked<JwtService>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };
  let commonSessionControlService: jest.Mocked<CommonSessionControlService>;
  let userRepository: jest.Mocked<Repository<User>>;
  let logger: jest.Mocked<Logger>;
  let handler: LogoutHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService = mockDeep<JwtService>();
    i18nService = { translate: jest.fn(), t: jest.fn() };
    commonSessionControlService = mockDeep<CommonSessionControlService>();
    userRepository = mockDeep<Repository<User>>();
    userRepository.save = jest.fn();
    logger = mockDeep<Logger>();

    handler = new LogoutHandler(
      userRepository,
      jwtService,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      i18nService as any,
      commonSessionControlService,
      logger,
    );
  });

  it('can be constructed', () => {
    expect(
      () =>
        new LogoutHandler(
          userRepository,
          jwtService,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          i18nService as any,
          commonSessionControlService,
          logger,
        ),
    ).not.toThrow();
  });

  it('returns failure when token is empty', async () => {
    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.emptyTokens().accessToken));
    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.invalidTokenResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure when token is only spaces', async () => {
    // Arrange
    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.spacesToken()));
    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.invalidTokenResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure when jwtService.verify throws (invalid token)', async () => {
    // Arrange
    jwtService.verify.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });
    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.invalidToken()));
    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.invalidTokenResponse().messageList);
    expect(result.success).toBe(false);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(logger.error).toHaveBeenCalled();
  });

  it('logs and returns failure if jwtService.verify throws a non-Error', async () => {
    // Arrange
    jwtService.verify.mockImplementationOnce(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'some string error';
    });
    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.invalidToken()));
    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.invalidTokenResponse().messageList);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('non-Error'), expect.stringContaining('some string error'));
    expect(result.success).toBe(false);
  });

  it('returns failure when payload is null', async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    jwtService.verify.mockReturnValueOnce(null as any);
    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.invalidToken()));
    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.invalidTokenResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure when payload has no sub or jti', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.invalidJwtPayload());
    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.invalidToken()));
    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.invalidTokenResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure when jti is not a valid UUID', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce({
      sub: 2,
      jti: LogoutHandlerFixture.getInvalidJti(),
      email: LogoutHandlerFixture.testEmail(),
      tokenType: 'access',
    });
    userRepository.findOne.mockResolvedValue(LogoutHandlerFixture.existingUser());

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.invalidToken()));

    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.invalidSessionIdResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure when user is not found', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.validDecoded());
    userRepository.findOne.mockResolvedValue(null);
    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));
    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.invalidCredentialsResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure when session is not active (not in Redis)', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.validJwtPayload());
    userRepository.findOne.mockResolvedValue(LogoutHandlerFixture.existingUser());
    commonSessionControlService.getSession.mockResolvedValue(null);

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(commonSessionControlService.getUserSessionKey).toHaveBeenCalledWith(LogoutHandlerFixture.userSession());
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.sessionNotActiveResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('removes session and returns success for valid token and active session', async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.validJwtPayload() as any);
    userRepository.findOne.mockResolvedValue(LogoutHandlerFixture.existingUser());
    commonSessionControlService.getUserSessionKey.mockReturnValue(LogoutHandlerFixture.getUserSessionKey());
    commonSessionControlService.getSession.mockResolvedValue(LogoutHandlerFixture.sessionActive());
    commonSessionControlService.deleteSession.mockResolvedValue(true);

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(commonSessionControlService.getUserSessionKey).toHaveBeenCalledWith(LogoutHandlerFixture.userSession());
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(commonSessionControlService.getSession).toHaveBeenCalledWith(LogoutHandlerFixture.getUserSessionKey());
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(commonSessionControlService.deleteSession).toHaveBeenCalledWith(LogoutHandlerFixture.getUserSessionKey());
    expect(apiResponseSuccess).toHaveBeenCalledWith(i18nService, true);
    expect(result).toEqual({
      success: true,
      data: true,
      messageList: [],
    });
  });

  it('removes session and returns success with false if session did not exist after check', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.validJwtPayload());
    userRepository.findOne.mockResolvedValue(LogoutHandlerFixture.existingUser());
    commonSessionControlService.getUserSessionKey.mockReturnValue(LogoutHandlerFixture.getUserSessionKey());
    commonSessionControlService.getSession.mockResolvedValue(LogoutHandlerFixture.sessionActive());
    commonSessionControlService.deleteSession.mockResolvedValue(false);

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(commonSessionControlService.deleteSession).toHaveBeenCalledWith(LogoutHandlerFixture.getUserSessionKey());
    expect(apiResponseSuccess).toHaveBeenCalledWith(i18nService, false);
    expect(result).toEqual({
      success: true,
      data: false,
      messageList: [],
    });
  });

  it('returns success if deleteSession returns null (graceful fallback)', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.validJwtPayload());
    userRepository.findOne.mockResolvedValue(LogoutHandlerFixture.existingUser());
    commonSessionControlService.getUserSessionKey.mockReturnValue(LogoutHandlerFixture.getUserSessionKey());
    commonSessionControlService.getSession.mockResolvedValue(LogoutHandlerFixture.sessionActive());
    commonSessionControlService.deleteSession.mockResolvedValue(null);

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));

    // Assert
    expect(apiResponseSuccess).toHaveBeenCalledWith(i18nService, false);
    expect(result).toEqual({
      success: true,
      data: false,
      messageList: [],
    });
  });

  it('returns failure when tokenType is not "access"', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce({
      sub: 2,
      jti: LogoutHandlerFixture.getValidUUID(),
      email: 'test@test.com',
      tokenType: 'refresh',
    });
    userRepository.findOne.mockResolvedValue(LogoutHandlerFixture.existingUser());

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));

    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.invalidTokenResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure when tokenType is missing', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce({
      sub: 2,
      jti: LogoutHandlerFixture.getValidUUID(),
      email: 'test@test.com',
    });
    userRepository.findOne.mockResolvedValue(LogoutHandlerFixture.existingUser());

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));

    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.invalidTokenResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('calls addLastLogoutAt and saves user on successful logout', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.validJwtPayload());
    const user = LogoutHandlerFixture.existingUser();
    userRepository.findOne.mockResolvedValue(user);
    commonSessionControlService.getUserSessionKey.mockReturnValue(LogoutHandlerFixture.getUserSessionKey());
    commonSessionControlService.getSession.mockResolvedValue(LogoutHandlerFixture.sessionActive());
    commonSessionControlService.deleteSession.mockResolvedValue(true);

    // Act
    await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        ...user,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        lastLogoutAt: expect.any(Date),
      }),
    );
  });

  it('does NOT update lastLogoutAt if user.id is falsy or accessToken is empty', async () => {
    // Arrange
    const user = { ...LogoutHandlerFixture.existingUser(), id: 0 } as User;

    userRepository.findOne.mockResolvedValue(user);
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.validJwtPayload());
    commonSessionControlService.getUserSessionKey.mockReturnValue(LogoutHandlerFixture.getUserSessionKey());
    commonSessionControlService.getSession.mockResolvedValue(LogoutHandlerFixture.sessionActive());
    commonSessionControlService.deleteSession.mockResolvedValue(true);

    // Act
    await handler.execute(new LogoutCommand('valid.jwt.token'));

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.save).not.toHaveBeenCalled();

    // También puedes probar con accessToken vacío
    await handler.execute(new LogoutCommand(''));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
