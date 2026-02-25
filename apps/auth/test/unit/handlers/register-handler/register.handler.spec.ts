import { hash as bcryptHash } from 'bcrypt';
import { mockDeep } from 'jest-mock-extended';
import { QueryFailedError } from 'typeorm';

import { type CommonSessionControlService } from '@common/redis/session';
import { apiResponseFailure, apiResponseSuccess } from '@common/responses';
import { ErrorOnFactory } from '@common/types';

import { RegisterCommand } from '@apps/auth/src/application/commands';
import { RegisterHandler } from '@apps/auth/src/application/handlers';
import { TokenValidationHelper } from '@apps/auth/src/application/helpers';
import { type AuthService, type HashService } from '@apps/auth/src/application/services';
import { JwtPayload } from '@apps/auth/src/application/value-objects';
import { AuthErrorMessageConstants } from '@apps/auth/src/constants';
import { type User } from '@apps/auth/src/domain/entities';
import { type IUserRepository } from '@apps/auth/src/domain/ports';

import { RegisterHandlerFixture } from './register.handler.fixture';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

let handler: RegisterHandler;

describe('RegisterHandler', () => {
  let authService: jest.Mocked<AuthService>;
  let userRepository: jest.Mocked<IUserRepository>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };
  let commonSessionControlService: jest.Mocked<CommonSessionControlService>;
  let hashService: jest.Mocked<HashService>;
  let userService: { getUserSessionWithDate: jest.Mock; getUserSessions: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    authService = mockDeep<AuthService>();
    userRepository = {
      findByEmail: jest.fn(),
      findByIdAndEmail: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };
    i18nService = { translate: jest.fn(), t: jest.fn() };
    commonSessionControlService = mockDeep<CommonSessionControlService>();
    commonSessionControlService.setSession.mockResolvedValue(RegisterHandlerFixture.getValidJti());
    commonSessionControlService.getUserSessionKey.mockReturnValue(RegisterHandlerFixture.getValidJti());
    hashService = mockDeep<HashService>();
    userService = {
      getUserSessionWithDate: jest.fn(),
      getUserSessions: jest.fn(),
    };

    handler = new RegisterHandler(
      userRepository,
      authService,
      commonSessionControlService,
      hashService,
      userService,
       
      i18nService as any,
    );
  });

  it('can be constructed', () => {
    expect(
      () =>
        new RegisterHandler(
          userRepository,
          authService,
          commonSessionControlService,
          hashService,
          userService,
           
          i18nService as any,
        ),
    ).not.toThrow();
  });

  it('returns failure when the email already exists', async () => {
    // Arrange
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RegisterHandlerFixture.emailExistsResponse());
    userRepository.findByEmail.mockResolvedValueOnce(RegisterHandlerFixture.existingUser());

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
    userRepository.findByEmail.mockResolvedValueOnce(null);
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
    userRepository.findByEmail.mockResolvedValueOnce(null);
    (bcryptHash as jest.Mock).mockResolvedValueOnce('hash');
    userRepository.save.mockResolvedValueOnce(RegisterHandlerFixture.createdUser());
    authService.generateTokens.mockResolvedValueOnce(RegisterHandlerFixture.validTokens());
    jest.mocked(apiResponseSuccess).mockResolvedValueOnce({
      success: true,
      data: RegisterHandlerFixture.validTokens(),
      messageList: [],
    });

    const spy = jest.spyOn(JwtPayload, 'create').mockReturnValueOnce(ErrorOnFactory.success(RegisterHandlerFixture.mockJwtPayload()));

    const sessionKey = RegisterHandlerFixture.getValidJti();
    commonSessionControlService.getUserSessionKey.mockReturnValue(sessionKey);

    userService.getUserSessionWithDate.mockReturnValue({
      userId: RegisterHandlerFixture.createdUser().id,
      sessionId: RegisterHandlerFixture.getValidJti(),
      loginAt: new Date().toISOString(),
    });
    const setSessionSpy = jest.spyOn(commonSessionControlService, 'setSession').mockReturnValueOnce(Promise.resolve(sessionKey));
    const saveSpy = jest.spyOn(userRepository, 'save');

    // Act
    const result = await handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()));

    // Assert

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(apiResponseSuccess).toHaveBeenCalledWith(i18nService, RegisterHandlerFixture.validTokens());
    expect(setSessionSpy).toHaveBeenCalledWith(
      sessionKey,
      expect.objectContaining({
        userId: RegisterHandlerFixture.createdUser().id,
        sessionId: RegisterHandlerFixture.getValidJti(),
         
        loginAt: expect.any(String),
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
    userRepository.findByEmail.mockResolvedValueOnce(null);
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
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(AuthErrorMessageConstants.invalidSessionId);

    spy.mockRestore();
    uuidSpy.mockRestore();
  });

  it('should return success but not update lastLoginAt if accessToken or refreshToken is empty', async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValueOnce(null);
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
    userRepository.findByEmail.mockResolvedValueOnce(null);
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

  it('forces BaseHandler failure branch by mocking createResponseFailure to throw', async () => {
    // Arrange
    const spy = jest.spyOn(handler as any, 'createResponseFailure').mockRejectedValueOnce(new Error('forced-error'));

    userRepository.findByEmail.mockResolvedValueOnce(RegisterHandlerFixture.existingUser());

    // Act
    let thrown = false;
    try {
      await handler.execute(new RegisterCommand('a@a.com', '1234'));
    } catch {
      thrown = true;
    }

    // Assert
    expect(thrown).toBe(true);

    spy.mockRestore();
  });

  it('forces BaseHandler success branch by mocking createSuccessResponse to throw', async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValueOnce(null);
    userRepository.save.mockResolvedValueOnce(RegisterHandlerFixture.createdUser());
    authService.generateTokens.mockResolvedValueOnce(RegisterHandlerFixture.validTokens());

    jest.spyOn(JwtPayload, 'create').mockReturnValueOnce(ErrorOnFactory.success(RegisterHandlerFixture.mockJwtPayload()));

    const spy = jest.spyOn(handler as any, 'createSuccessResponse').mockRejectedValueOnce(new Error('forced-success-error'));

    // Act
    let thrown = false;
    try {
      await handler.execute(new RegisterCommand('test@test.com', '1234'));
    } catch {
      thrown = true;
    }

    // Assert
    expect(thrown).toBe(true);

    spy.mockRestore();
  });

  it('forces internal JwtPayload.create branches by mocking multiple return types', async () => {
    // Arrange
    const createdUser = RegisterHandlerFixture.createdUser();

    userRepository.findByEmail.mockResolvedValueOnce(null);
    hashService.hash.mockResolvedValueOnce('hash');
    userRepository.save.mockResolvedValueOnce(createdUser);

    const createSpyError = jest.spyOn(JwtPayload, 'create').mockReturnValueOnce(ErrorOnFactory.error('forced-error'));

    // Act (1)
    const resultError = await handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()));

    expect(resultError.success).toBe(false);

    userRepository.findByEmail.mockResolvedValueOnce(null);
    hashService.hash.mockResolvedValueOnce('hash');
    userRepository.save.mockResolvedValueOnce(createdUser);
    authService.generateTokens.mockResolvedValueOnce(RegisterHandlerFixture.validTokens());

    const createSpySuccess = jest.spyOn(JwtPayload, 'create').mockReturnValueOnce(ErrorOnFactory.success(RegisterHandlerFixture.mockJwtPayload()));

    // Act (2)
    const resultSuccess = await handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()));

    // Assert (2)
    expect(resultSuccess.success).toBe(true);

    createSpyError.mockRestore();
    createSpySuccess.mockRestore();
  });

  it('forces both branches of TokenValidationHelper.validateUUID', async () => {
    // Arrange — shared
    const user = RegisterHandlerFixture.createdUser();
    const validJti = RegisterHandlerFixture.getValidJti();
    const expectedSessionKey = 'session-key';

    //
    // ===== FIRST BRANCH → validateUUID returns error =====
    //

    const spyError = jest.spyOn(TokenValidationHelper, 'validateUUID').mockResolvedValueOnce({ isError: true, errorMessage: 'invalid' });

    // Act (error)
     
    const resultError = await (handler as any).setCacheSession(user, 'bad-uuid');

    // Assert (error)
    expect(resultError).toBeNull();

    //
    // ===== SECOND BRANCH → validateUUID returns success =====
    //

    const spySuccess = jest.spyOn(TokenValidationHelper, 'validateUUID').mockResolvedValueOnce({ isError: false });

    commonSessionControlService.getUserSessionKey.mockReturnValue(expectedSessionKey);
    commonSessionControlService.setSession.mockResolvedValueOnce(expectedSessionKey);

    // Act (success)
     
    const resultSuccess = await (handler as any).setCacheSession(user, validJti);

    // Assert (success)
    expect(resultSuccess).toBe(expectedSessionKey);

    //
    // Cleanup
    //
    spyError.mockRestore();
    spySuccess.mockRestore();
  });


  it('should return null if jti is empty', async () => {
    // Arrange
    const user = RegisterHandlerFixture.createdUser();

    // Act
     
    const resultEmpty = await (handler as any).setCacheSession(user, '');
     
    const resultNull = await (handler as any).setCacheSession(user, null);
     
    const resultUndefined = await (handler as any).setCacheSession(user, undefined);

    // Assert
    expect(resultEmpty).toBeNull();
    expect(resultNull).toBeNull();
    expect(resultUndefined).toBeNull();
  });

  it('returns failure when save throws QueryFailedError with duplicate entry (ER_DUP_ENTRY)', async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValueOnce(null);
    (bcryptHash as jest.Mock).mockResolvedValueOnce('hash');

    const duplicateError = Object.create(QueryFailedError.prototype);
    Object.assign(duplicateError, {
      code: 'ER_DUP_ENTRY',
      message: 'Duplicate entry',
      query: '',
      parameters: [],
    });

    userRepository.save.mockRejectedValueOnce(duplicateError);
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RegisterHandlerFixture.emailExistsResponse());

    // Act
    const result = await handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()));

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(AuthErrorMessageConstants.emailAlreadyExists);
  });

  it('returns failure when save throws QueryFailedError with duplicate entry (errno 1062)', async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValueOnce(null);
    (bcryptHash as jest.Mock).mockResolvedValueOnce('hash');

    const duplicateError = Object.create(QueryFailedError.prototype);
    Object.assign(duplicateError, {
      errno: 1062,
      message: 'Duplicate entry',
      query: '',
      parameters: [],
    });

    userRepository.save.mockRejectedValueOnce(duplicateError);
    jest.mocked(apiResponseFailure).mockResolvedValueOnce(RegisterHandlerFixture.emailExistsResponse());

    // Act
    const result = await handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()));

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(AuthErrorMessageConstants.emailAlreadyExists);
  });

  it('rethrows error when save throws non-duplicate QueryFailedError', async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValueOnce(null);
    (bcryptHash as jest.Mock).mockResolvedValueOnce('hash');

    const otherError = Object.create(QueryFailedError.prototype);
    Object.assign(otherError, {
      code: 'ER_OTHER_ERROR',
      message: 'Some other database error',
      query: '',
      parameters: [],
    });

    userRepository.save.mockRejectedValueOnce(otherError);

    // Act & Assert
    await expect(handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()))).rejects.toThrow(QueryFailedError);
  });

  it('rethrows error when save throws non-QueryFailedError', async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValueOnce(null);
    (bcryptHash as jest.Mock).mockResolvedValueOnce('hash');

    const genericError = new Error('Generic error');
    userRepository.save.mockRejectedValueOnce(genericError);

    // Act & Assert
    await expect(handler.execute(new RegisterCommand(RegisterHandlerFixture.testEmail(), RegisterHandlerFixture.testPassword()))).rejects.toThrow('Generic error');
  });
});
