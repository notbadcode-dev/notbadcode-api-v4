import { HttpStatus, Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { EJwtType, JwtPayloadPlain } from '@common/auth';
import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { CommonSessionControlService } from '@common/redis/session';
import { ApiResponse } from '@common/responses';

import { LogoutCommand } from '@apps/auth/src/application/commands';
import { TokenValidationHelper } from '@apps/auth/src/application/helpers';
import { UserService } from '@apps/auth/src/application/services';
import { AuthErrorMessageConstants, JwtConstants } from '@apps/auth/src/constants';
import { User } from '@apps/auth/src/domain/entities';
import { type IUserRepository } from '@apps/auth/src/domain/ports';

@CommandHandler(LogoutCommand)
export class LogoutHandler extends BaseHandler<LogoutCommand, ApiResponse<null>> implements ICommandHandler<LogoutCommand, ApiResponse<null>> {
  /* istanbul ignore next */
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly commonSessionControlService: CommonSessionControlService,
    private readonly logger: Logger,
    private readonly userService: UserService,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: LogoutCommand): Promise<ApiResponse<null>> {
    const { accessToken } = command;

    const tokenPresenceResult = await TokenValidationHelper.validateTokenPresence(accessToken);
    if (tokenPresenceResult.isError) {
      return await this.createResponseFailure(tokenPresenceResult.errorMessage, HttpStatus.UNAUTHORIZED);
    }

    let payload: JwtPayloadPlain<number> | null;
    try {
      payload = this.jwtService.verify<JwtPayloadPlain<number>>(accessToken);
    } catch (error: unknown) {
      this.logErrorJwtVerify(error);
      return await this.createResponseFailure(AuthErrorMessageConstants.invalidToken, HttpStatus.UNAUTHORIZED);
    }

    const payloadResult = await TokenValidationHelper.validatePayload(payload);
    if (payloadResult.isError) {
      return await this.createResponseFailure(payloadResult.errorMessage, HttpStatus.UNAUTHORIZED);
    }

    const { sub, jti, email } = payload;
    const tokenTypeResult = await TokenValidationHelper.validateTokenType(payload, EJwtType.ACCESS);
    if (tokenTypeResult.isError) {
      return await this.createResponseFailure(tokenTypeResult.errorMessage, HttpStatus.UNAUTHORIZED);
    }

    const uuidResult = await TokenValidationHelper.validateUUID(jti);
    if (uuidResult.isError) {
      return await this.createResponseFailure(uuidResult.errorMessage, HttpStatus.UNAUTHORIZED);
    }

    const user = await this.userRepository.findByIdAndEmail(sub, email);
    if (!user) {
      return await this.createResponseFailure(AuthErrorMessageConstants.invalidCredentials, HttpStatus.UNAUTHORIZED);
    }

    const userSession = this.userService.getUserSessions(user.id, jti);

    const key = this.commonSessionControlService.getUserSessionKey(userSession);
    const activeSession = await this.commonSessionControlService.getSession(key);
    if (!activeSession) {
      return await this.createResponseFailure(AuthErrorMessageConstants.sessionNotActive, HttpStatus.UNAUTHORIZED);
    }

    const resultDelete = await this.commonSessionControlService.deleteSession(key);
    if (!resultDelete) {
      return await this.createResponseFailure(AuthErrorMessageConstants.sessionNotActive, HttpStatus.UNAUTHORIZED);
    }

    await this.addLastLogoutAt(accessToken, user);

    return await this.createSuccessResponse(null);
  }

  private async addLastLogoutAt(accessToken: string, user: User): Promise<void> {
    if (!user?.id || !accessToken?.length) {
      return;
    }

    user.lastLogoutAt = new Date();
    await this.userRepository.save(user);
  }

  private logErrorJwtVerify(error: unknown): void {
    if (error instanceof Error) {
      this.logger.error(JwtConstants.LogJwtVerificationFailed, error.stack);
    }

    this.logger.error(JwtConstants.LogJwtVerificationFailedNonError, String(error));
  }
}
