import { Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { I18nService } from '@common/i18n';
import { CommonSessionControlService } from '@common/redis/session';
import { UserSession } from '@common/redis/session/userSession.model';
import { ApiResponse, ApiResponseService, apiResponseSuccess } from '@common/responses';

import { RefreshCommand } from '@apps/auth/src/application/commands';
import { LoginResponseDto } from '@apps/auth/src/application/dtos';
import { TokenValidationHelper } from '@apps/auth/src/application/helpers/token-validation.helper';
import { JwtPayload, JwtPayloadPlain } from '@apps/auth/src/application/value-objects';
import { AuthService } from '@apps/auth/src/auth.service';
import { JwtConstants } from '@apps/auth/src/constants';

import { EJwtType } from '../../infrastructure/jwt/jwt-type.enum';

@CommandHandler(RefreshCommand)
export class RefreshHandler implements ICommandHandler<RefreshCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly i18nService: I18nService,
    private readonly apiResponseService: ApiResponseService,
    private readonly commonSessionControlService: CommonSessionControlService,
    private readonly logger: Logger,
  ) {}

  async execute(command: RefreshCommand): Promise<ApiResponse<LoginResponseDto>> {
    const { refreshToken: accessToken } = command;

    const tokenPresenceError = await TokenValidationHelper.validateTokenPresence(
      accessToken,
      this.i18nService,
    );
    if (tokenPresenceError) {
      return tokenPresenceError;
    }

    let payload: JwtPayloadPlain<number> | null;

    try {
      payload = this.jwtService.verify<JwtPayloadPlain<number>>(accessToken);
    } catch (error: unknown) {
      this.logErrorJwtVerify(error);
      return await TokenValidationHelper.invalidToken(this.i18nService);
    }

    const payloadError = await TokenValidationHelper.validatePayload(payload, this.i18nService);
    if (payloadError) {
      return payloadError;
    }

    const tokenTypeError = await TokenValidationHelper.validateTokenType(
      payload,
      EJwtType.REFRESH,
      this.i18nService,
    );
    if (tokenTypeError) return tokenTypeError;

    const uuidError = await TokenValidationHelper.validateUUID(payload.jti as string, this.i18nService);
    if (uuidError) return uuidError;

    const { sub, jti, email } = payload;

    const userSession: UserSession = {
      userId: sub,
      sessionId: jti,
    };
    const sessionKey = this.commonSessionControlService.getUserSessionKey(userSession);
    const activeSession = await this.commonSessionControlService.getSession(sessionKey);
    if (!activeSession) {
      return await TokenValidationHelper.sessionNotActive(this.i18nService);
    }

    const payloadResult = JwtPayload.create(sub, email, this.apiResponseService);
    if (!payloadResult.success) {
      return payloadResult;
    }

    const tokens = await this.authService.generateTokens(payloadResult.data);

    const refreshedSession: UserSession = {
      userId: sub,
      sessionId: payloadResult.data.jti,
      loginAt: new Date().toISOString(),
    };
    const refreshedSessionKey = this.commonSessionControlService.getUserSessionKey(refreshedSession);
    await this.commonSessionControlService.setSession<UserSession>(refreshedSessionKey, refreshedSession);

    return await apiResponseSuccess(this.i18nService, tokens);
  }

  private logErrorJwtVerify(error: unknown) {
    if (error instanceof Error) {
      this.logger.error(JwtConstants.LogJwtVerificationFailed, error.stack);
    } else {
      this.logger.error(JwtConstants.LogJwtVerificationFailedNonError, String(error));
    }
  }
}
