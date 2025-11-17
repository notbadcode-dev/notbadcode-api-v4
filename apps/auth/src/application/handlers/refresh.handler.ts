import { Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { EJwtType, JwtPayloadPlain } from '@common/auth';
import { BaseHandler } from '@common/handler/base.handler';
import { I18nService } from '@common/i18n';
import { CommonSessionControlService } from '@common/redis/session';
import { UserSession } from '@common/redis/session/userSession.model';
import { ApiResponse } from '@common/responses';

import { RefreshCommand } from '@apps/auth/src/application/commands';
import { LoginResponseDto } from '@apps/auth/src/application/dtos';
import { TokenValidationHelper } from '@apps/auth/src/application/helpers/token-validation.helper';
import { AuthService } from '@apps/auth/src/application/services/auth.service';
import { JwtPayload } from '@apps/auth/src/application/value-objects';
import { AuthErrorMessageConstants, JwtConstants } from '@apps/auth/src/constants';

@CommandHandler(RefreshCommand)
export class RefreshHandler extends BaseHandler<RefreshCommand, ApiResponse<LoginResponseDto>> implements ICommandHandler<RefreshCommand, ApiResponse<LoginResponseDto>> {
  /* istanbul ignore next */
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    i18nService: I18nService,
    private readonly commonSessionControlService: CommonSessionControlService,
    private readonly logger: Logger,
  ) {
    super(i18nService);
  }

  async execute(command: RefreshCommand): Promise<ApiResponse<LoginResponseDto>> {
    const { refreshToken: accessToken } = command;

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

    const validatePayloadResult = await TokenValidationHelper.validatePayload(payload);
    if (validatePayloadResult.isError) {
      return await this.createResponseFailure(validatePayloadResult.errorMessage);
    }

    const tokenTypeResult = await TokenValidationHelper.validateTokenType(payload, EJwtType.REFRESH);
    if (tokenTypeResult.isError) return await this.createResponseFailure(tokenTypeResult.errorMessage);

    const uuidResult = await TokenValidationHelper.validateUUID(payload.jti as string);
    if (uuidResult.isError) {
      return await this.createResponseFailure(uuidResult.errorMessage);
    }

    const { sub, jti, email } = payload;

    const userSession: UserSession = {
      userId: sub,
      sessionId: jti,
    };
    const sessionKey = this.commonSessionControlService.getUserSessionKey(userSession);
    const activeSession = await this.commonSessionControlService.getSession(sessionKey);
    if (!activeSession) {
      return this.createResponseFailure(AuthErrorMessageConstants.sessionNotActive);
    }

    const createPayloadResult = JwtPayload.create(sub, email);
    if (createPayloadResult.isError) {
      return await this.createResponseFailure(createPayloadResult.errorMessage);
    }

    const createdPayload = createPayloadResult.value;
    const tokens = await this.authService.generateTokens(createdPayload);

    const refreshedSession: UserSession = {
      userId: sub,
      sessionId: createdPayload.jti,
      loginAt: new Date().toISOString(),
    };
    const refreshedSessionKey = this.commonSessionControlService.getUserSessionKey(refreshedSession);
    await this.commonSessionControlService.setSession<UserSession>(refreshedSessionKey, refreshedSession);

    return await this.createSuccessResponse(tokens);
  }

  private logErrorJwtVerify(error: unknown): void {
    if (error instanceof Error) {
      this.logger.error(JwtConstants.LogJwtVerificationFailed, error.stack);
    } else {
      this.logger.error(JwtConstants.LogJwtVerificationFailedNonError, String(error));
    }
  }
}
