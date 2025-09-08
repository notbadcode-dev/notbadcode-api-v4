import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PatternConstants } from '@common/constants';
import { I18nService } from '@common/i18n';
import { CommonSessionControlService } from '@common/redis/session';
import { UserSession } from '@common/redis/session/userSession.model';
import {
  ApiFailureResponse,
  ApiResponse,
  apiResponseFailure,
  apiResponseSuccess,
  EApiResponseMessageType,
} from '@common/responses';

import { LogoutCommand } from '@apps/auth/src/application/commands';
import { JwtPayloadPlain } from '@apps/auth/src/application/value-objects';
import { AuthErrorMessageConstants, JwtConstants } from '@apps/auth/src/constants';
import { User } from '@apps/auth/src/domain/entities/user.entity';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly i18nService: I18nService,
    private readonly commonSessionControlService: CommonSessionControlService,
    private readonly logger: Logger,
  ) {}

  async execute(command: LogoutCommand): Promise<ApiResponse<boolean>> {
    const { accessToken } = command;

    if (!accessToken?.trim()) {
      return this.returnInvalidToken();
    }

    let payload: JwtPayloadPlain<number> | null;

    try {
      payload = this.jwtService.verify<JwtPayloadPlain<number>>(accessToken);
    } catch (error: unknown) {
      this.logErrorJwtVerify(error);
      return this.returnInvalidToken();
    }

    if (!payload) {
      return this.returnInvalidToken();
    }

    const { sub, jti, email } = payload;

    if (typeof sub !== 'number' || !jti || !email) {
      return this.returnInvalidToken();
    }

    if (!PatternConstants.validationUUID.test(jti)) {
      return this.returnInvalidSessionId();
    }

    const user = await this.userRepository.findOne({ where: { id: sub, email } });
    if (!user) {
      return this.returnInvalidCredentials();
    }

    const userSession: UserSession = {
      userId: sub,
      sessionId: jti,
    };

    const key = this.commonSessionControlService.getUserSessionKey(userSession);
    const activeSession = await this.commonSessionControlService.getSession(key);
    if (!activeSession) {
      return this.returnSessionNotActive();
    }

    const resultDelete = (await this.commonSessionControlService.deleteSession(key)) ?? false;

    return apiResponseSuccess(this.i18nService, resultDelete);
  }

  private logErrorJwtVerify(error: unknown) {
    if (error instanceof Error) {
      this.logger.error(JwtConstants.LogJwtVerificationFailed, error.stack);
    } else {
      this.logger.error(JwtConstants.LogJwtVerificationFailedNonError, String(error));
    }
  }

  private returnInvalidToken(): Promise<ApiFailureResponse> {
    return apiResponseFailure(this.i18nService, [
      {
        type: EApiResponseMessageType.Error,
        message: AuthErrorMessageConstants.invalidToken,
      },
    ]);
  }

  private returnInvalidCredentials(): Promise<ApiFailureResponse> {
    return apiResponseFailure(this.i18nService, [
      {
        type: EApiResponseMessageType.Error,
        message: AuthErrorMessageConstants.invalidCredentials,
      },
    ]);
  }

  private returnInvalidSessionId(): Promise<ApiFailureResponse> {
    return apiResponseFailure(this.i18nService, [
      {
        type: EApiResponseMessageType.Error,
        message: AuthErrorMessageConstants.invalidSessionId,
      },
    ]);
  }

  private returnSessionNotActive(): Promise<ApiFailureResponse> {
    return apiResponseFailure(this.i18nService, [
      {
        type: EApiResponseMessageType.Error,
        message: AuthErrorMessageConstants.sessionNotActive,
      },
    ]);
  }
}
