import { UUID } from 'node:crypto';

import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { I18nService } from '@common/i18n';
import {
  ApiResponse,
  apiResponseFailure,
  apiResponseSuccess,
} from '@common/responses';
import { CommonSessionControlService } from '@common/redis/session';
import { UserSession } from '@common/redis/session/userSession.model';

import { LogoutCommand } from '../commands';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly i18nService: I18nService,
    private readonly commonSessionControlService: CommonSessionControlService,
  ) {}

  async execute(command: LogoutCommand): Promise<ApiResponse<null>> {
    const { token } = command;

    const decoded = this.jwtService.decode(token) as { sub?: number; jti?: UUID } | null;

    if (!decoded?.sub || !decoded?.jti) {
      return apiResponseFailure(this.i18nService);
    }

    const userSession: UserSession = {
      userId: decoded.sub,
      sessionId: decoded.jti,
      loginAt: '',
    };
    const key = this.commonSessionControlService.getUserSessionKey(userSession);
    await this.commonSessionControlService.deleteSession(key);

    return apiResponseSuccess(this.i18nService, null);
  }
}
