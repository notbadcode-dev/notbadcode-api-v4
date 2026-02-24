/* eslint-disable @typescript-eslint/no-magic-numbers */
import { type Logger } from '@nestjs/common';
import { type JwtService } from '@nestjs/jwt';
import { mockDeep } from 'jest-mock-extended';

import { type CommonSessionControlService } from '@common/redis/session';
import { apiResponseFailure, apiResponseSuccess } from '@common/responses';

import { LogoutCommand } from '@apps/auth/src/application/commands';
import { LogoutHandler } from '@apps/auth/src/application/handlers/logout.handler';
import { type User } from '@apps/auth/src/domain/entities';
import { type IUserRepository } from '@apps/auth/src/domain/ports';

import { LogoutHandlerFixture } from './logout.handler.fixture';

describe('LogoutHandler', () => {
  let jwtService: jest.Mocked<JwtService>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };
  let commonSessionControlService: jest.Mocked<CommonSessionControlService>;
  let userRepository: jest.Mocked<IUserRepository>;
  let logger: jest.Mocked<Logger>;
  let handler: LogoutHandler;
  let userService: { getUserSessionWithDate: jest.Mock; getUserSessions: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService = mockDeep<JwtService>();
    i18nService = { translate: jest.fn(), t: jest.fn() };
    commonSessionControlService = mockDeep<CommonSessionControlService>();
    userRepository = {
      findByEmail: jest.fn(),
      findByIdAndEmail: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };
    logger = mockDeep<Logger>();
    userService = {
      getUserSessionWithDate: jest.fn(),
      getUserSessions: jest.fn(),
    };

    handler = new LogoutHandler(
      userRepository,
      jwtService,
      commonSessionControlService,
      logger,
      userService,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      i18nService as any,
    );
  });

  it('can be constructed', () => {
    expect(
      () =>
        new LogoutHandler(
          userRepository,
          jwtService,
          commonSessionControlService,
          logger,
          userService,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          i18nService as any,
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
    // Forzar el id esperado por el fixture
    userRepository.findByIdAndEmail.mockResolvedValue({ ...LogoutHandlerFixture.existingUser(), id: LogoutHandlerFixture.existingUser().id });

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.invalidToken()));

    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.invalidSessionIdResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure when user is not found', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.validDecoded());
    userRepository.findByIdAndEmail.mockResolvedValue(null);
    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));
    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.invalidCredentialsResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure when session is not active (not in Redis)', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.validJwtPayload());
    // Mock completo para cumplir con la interfaz y el id esperado
    const userMock = { ...LogoutHandlerFixture.existingUser(), id: 2 } as User;
    userRepository.findByIdAndEmail.mockResolvedValue(userMock);
    commonSessionControlService.getUserSessionKey.mockReturnValue(LogoutHandlerFixture.getUserSessionKey());
    commonSessionControlService.getSession.mockResolvedValue(null);
    userService.getUserSessionWithDate.mockReturnValue(LogoutHandlerFixture.userSession());

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(commonSessionControlService.getUserSessionKey).toHaveBeenCalled();
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.sessionNotActiveResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('removes session and returns success for valid token and active session', async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.validJwtPayload() as any);
    userRepository.findByIdAndEmail.mockResolvedValue(LogoutHandlerFixture.existingUser());
    commonSessionControlService.getUserSessionKey.mockImplementation((session) => {
      if (session) {
        return LogoutHandlerFixture.getUserSessionKey();
      }
      return '';
    });
    commonSessionControlService.getSession.mockResolvedValue(LogoutHandlerFixture.sessionActive());
    commonSessionControlService.deleteSession.mockResolvedValue(true);
    userService.getUserSessions.mockReturnValue(LogoutHandlerFixture.getUserSession());
    userService.getUserSessions = jest.fn().mockReturnValue(LogoutHandlerFixture.getUserSession());
    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(commonSessionControlService.getUserSessionKey).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: LogoutHandlerFixture.userSession().sessionId,
        userId: LogoutHandlerFixture.userSession().userId,
      }),
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(commonSessionControlService.getSession).toHaveBeenCalledWith(LogoutHandlerFixture.getUserSessionKey());
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(commonSessionControlService.deleteSession).toHaveBeenCalledWith(LogoutHandlerFixture.getUserSessionKey());
    expect(apiResponseSuccess).toHaveBeenCalledWith(i18nService, null);
    expect(result).toEqual({
      success: true,
      data: null,
      messageList: [],
    });
  });

  it('returns failure if deleteSession returns false after active-session check', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.validJwtPayload());
    userRepository.findByIdAndEmail.mockResolvedValue(LogoutHandlerFixture.existingUser());
    commonSessionControlService.getUserSessionKey.mockReturnValue(LogoutHandlerFixture.getUserSessionKey());
    commonSessionControlService.getSession.mockResolvedValue(LogoutHandlerFixture.sessionActive());
    commonSessionControlService.deleteSession.mockResolvedValue(false);

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(commonSessionControlService.deleteSession).toHaveBeenCalledWith(LogoutHandlerFixture.getUserSessionKey());
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.sessionNotActiveResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure if deleteSession returns null', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce(LogoutHandlerFixture.validJwtPayload());
    userRepository.findByIdAndEmail.mockResolvedValue(LogoutHandlerFixture.existingUser());
    commonSessionControlService.getUserSessionKey.mockReturnValue(LogoutHandlerFixture.getUserSessionKey());
    commonSessionControlService.getSession.mockResolvedValue(LogoutHandlerFixture.sessionActive());
    commonSessionControlService.deleteSession.mockResolvedValue(null);

    // Act
    const result = await handler.execute(new LogoutCommand(LogoutHandlerFixture.validTokens().accessToken));

    // Assert
    expect(apiResponseFailure).toHaveBeenCalledWith(i18nService, LogoutHandlerFixture.sessionNotActiveResponse().messageList);
    expect(result.success).toBe(false);
  });

  it('returns failure when tokenType is not "access"', async () => {
    // Arrange
    jwtService.verify.mockReturnValueOnce({
      sub: 2,
      jti: LogoutHandlerFixture.getValidUUID(),
      email: 'test@test.com',
      tokenType: 'refresh',
    });
    userRepository.findByIdAndEmail.mockResolvedValue(LogoutHandlerFixture.existingUser());

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
    userRepository.findByIdAndEmail.mockResolvedValue(LogoutHandlerFixture.existingUser());

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
    userRepository.findByIdAndEmail.mockResolvedValue(user);
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

    userRepository.findByIdAndEmail.mockResolvedValue(user);
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
