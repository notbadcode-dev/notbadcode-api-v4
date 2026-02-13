import { Inject, Logger } from '@nestjs/common';
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
export class LogoutHandler extends BaseHandler<LogoutCommand, ApiResponse<boolean>> implements ICommandHandler<LogoutCommand, ApiResponse<boolean>> {
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

  async execute(command: LogoutCommand): Promise<ApiResponse<boolean>> {
    const { accessToken } = command;

    const tokenPresenceResult = await TokenValidationHelper.validateTokenPresence(accessToken);
    if (tokenPresenceResult.isError) {
      return await this.createResponseFailure(tokenPresenceResult.errorMessage);
    }

    let payload: JwtPayloadPlain<number> | null;
    try {
      payload = this.jwtService.verify<JwtPayloadPlain<number>>(accessToken);
    } catch (error: unknown) {
      this.logErrorJwtVerify(error);
      return await this.createResponseFailure(AuthErrorMessageConstants.invalidToken);
    }

    const payloadResult = await TokenValidationHelper.validatePayload(payload);
    if (payloadResult.isError) {
      return await this.createResponseFailure(payloadResult.errorMessage);
    }

    const { sub, jti, email } = payload;
    const tokenTypeResult = await TokenValidationHelper.validateTokenType(payload, EJwtType.ACCESS);
    if (tokenTypeResult.isError) {
      return await this.createResponseFailure(tokenTypeResult.errorMessage);
    }

    const uuidResult = await TokenValidationHelper.validateUUID(jti);
    if (uuidResult.isError) {
      return await this.createResponseFailure(uuidResult.errorMessage);
    }

    const user = await this.userRepository.findByIdAndEmail(sub, email);
    if (!user) {
      return await this.createResponseFailure(AuthErrorMessageConstants.invalidCredentials);
    }

    const userSession = this.userService.getUserSessions(user.id, jti);

    const key = this.commonSessionControlService.getUserSessionKey(userSession);
    const activeSession = await this.commonSessionControlService.getSession(key);
    if (!activeSession) {
      return await this.createResponseFailure(AuthErrorMessageConstants.sessionNotActive);
    }

    const resultDelete = (await this.commonSessionControlService.deleteSession(key)) ?? false;

    await this.addLastLogoutAt(accessToken, user);

    return await this.createSuccessResponse(resultDelete);
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
