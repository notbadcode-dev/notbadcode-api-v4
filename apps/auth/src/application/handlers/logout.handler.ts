import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { I18nService } from '@common/i18n';
import { CommonSessionControlService } from '@common/redis/session';
import { UserSession } from '@common/redis/session/userSession.model';
import { ApiResponse, apiResponseSuccess } from '@common/responses';

import { LogoutCommand } from '@apps/auth/src/application/commands';
import { TokenValidationHelper } from '@apps/auth/src/application/helpers/token-validation.helper';
import { JwtPayloadPlain } from '@apps/auth/src/application/value-objects';
import { JwtConstants } from '@apps/auth/src/constants';
import { User } from '@apps/auth/src/domain/entities';
import { EJwtType } from '@apps/auth/src/infrastructure/jwt/jwt-type.enum';

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

    const { sub, jti, email } = payload;
    const tokenTypeError = await TokenValidationHelper.validateTokenType(
      payload,
      EJwtType.ACCESS,
      this.i18nService,
    );
    if (tokenTypeError) {
      return tokenTypeError;
    }

    const uuidError = await TokenValidationHelper.validateUUID(jti, this.i18nService);
    if (uuidError) {
      return uuidError;
    }

    const user = await this.userRepository.findOne({ where: { id: sub, email } });
    if (!user) {
      return await TokenValidationHelper.invalidCredentials(this.i18nService);
    }

    const userSession: UserSession = {
      userId: sub,
      sessionId: jti,
    };

    const key = this.commonSessionControlService.getUserSessionKey(userSession);
    const activeSession = await this.commonSessionControlService.getSession(key);
    if (!activeSession) {
      return await TokenValidationHelper.sessionNotActive(this.i18nService);
    }

    const resultDelete = (await this.commonSessionControlService.deleteSession(key)) ?? false;
    return apiResponseSuccess(this.i18nService, resultDelete);
  }

  private logErrorJwtVerify(error: unknown): void {
    if (error instanceof Error) {
      this.logger.error(JwtConstants.LogJwtVerificationFailed, error.stack);
    } else {
      this.logger.error(JwtConstants.LogJwtVerificationFailedNonError, String(error));
    }
  }
}
