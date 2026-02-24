import { UUID } from 'node:crypto';

import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QueryFailedError } from 'typeorm';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { CommonSessionControlService } from '@common/redis/session';
import { UserSession } from '@common/redis/session/user-session.model';
import { ApiResponse } from '@common/responses';

import { RegisterCommand } from '@apps/auth/src/application/commands';
import { TokenValidationHelper } from '@apps/auth/src/application/helpers';
import { LoginResponse } from '@apps/auth/src/application/responses';
import { AuthService, HashService, UserService } from '@apps/auth/src/application/services';
import { JwtPayload } from '@apps/auth/src/application/value-objects';
import { AuthErrorMessageConstants } from '@apps/auth/src/constants';
import { User } from '@apps/auth/src/domain/entities';
import { type IUserRepository } from '@apps/auth/src/domain/ports';

@CommandHandler(RegisterCommand)
export class RegisterHandler extends BaseHandler<RegisterCommand, ApiResponse<LoginResponse>> implements ICommandHandler<RegisterCommand, ApiResponse<LoginResponse>> {
  /* istanbul ignore next */
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
    private readonly commonSessionControlService: CommonSessionControlService,
    private readonly hashService: HashService,
    private readonly userService: UserService,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: RegisterCommand): Promise<ApiResponse<LoginResponse>> {
    const { email, password } = command;

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      return await this.createResponseFailure(AuthErrorMessageConstants.emailAlreadyExists, HttpStatus.CONFLICT);
    }

    const passwordHash = await this.hashService.hash(password);

    const user = this.userRepository.create({ email, passwordHash });

    let savedUser: User;
    try {
      savedUser = await this.userRepository.save(user);
    } catch (error) {
      if (this.isDuplicateEntryError(error)) {
        return this.createResponseFailure(AuthErrorMessageConstants.emailAlreadyExists, HttpStatus.CONFLICT);
      }
      throw error;
    }

    const payloadResult = JwtPayload.create(savedUser.id, savedUser.email);
    if (payloadResult.isError) {
      return await this.createResponseFailure(payloadResult.errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const payload = payloadResult.value;
    const tokens = await this.authService.generateTokens(payload);

    const sessionKey = await this.setCacheSession(savedUser, payload.jti);
    if (!sessionKey) {
      return this.createResponseFailure(AuthErrorMessageConstants.invalidSessionId, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return await this.createSuccessResponse(tokens);
  }

  private async setCacheSession(user: User, jti: string): Promise<string | null> {
    const uuidResult = await TokenValidationHelper.validateUUID(jti);
    if (uuidResult.isError) {
      return null;
    }

    const userSession = this.userService.getUserSessionWithDate(user.id, jti as UUID);
    const userSessionKey = this.commonSessionControlService.getUserSessionKey(userSession);
    return await this.commonSessionControlService.setSession<UserSession>(userSessionKey, userSession);
  }

  private isDuplicateEntryError(error: unknown): boolean {
    if (error instanceof QueryFailedError) {
      const dbError = error as QueryFailedError & { code?: string; errno?: number };
      return dbError.code === 'ER_DUP_ENTRY' || dbError.errno === 1062;
    }
    return false;
  }
}
