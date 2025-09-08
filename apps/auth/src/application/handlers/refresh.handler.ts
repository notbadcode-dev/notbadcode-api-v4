import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { I18nService } from '@common/i18n';
import { CommonSessionControlService } from '@common/redis/session';
import { UserSession } from '@common/redis/session/userSession.model';
import {
  apiResponseFailure,
  ApiResponse,
  ApiResponseService,
  apiResponseSuccess,
  EApiResponseMessageType,
} from '@common/responses';

import { AuthService } from '../../auth.service';
import { AuthErrorMessageConstants } from '../../constants';
import { LoginResponseDto } from '../dtos';
import { JwtPayload } from '../value-objects';
import { RefreshCommand } from '../commands';

@CommandHandler(RefreshCommand)
export class RefreshHandler implements ICommandHandler<RefreshCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly i18nService: I18nService,
    private readonly apiResponseService: ApiResponseService,
    private readonly commonSessionControlService: CommonSessionControlService,
  ) {}

  async execute(command: RefreshCommand): Promise<ApiResponse<LoginResponseDto>> {
    try {
      const decoded = await this.jwtService.verifyAsync<{ sub: number; email: string }>(command.accessToken);

      const payloadResult = JwtPayload.create(decoded.sub, decoded.email, this.apiResponseService);
      if (!payloadResult.success) {
        return payloadResult;
      }

      const tokens = await this.authService.generateTokens(payloadResult.data);

      const userSession: UserSession = {
        userId: decoded.sub,
        sessionId: payloadResult.data.jti,
        loginAt: new Date().toISOString(),
      };
      const key = this.commonSessionControlService.getUserSessionKey(userSession);
      await this.commonSessionControlService.setSession<UserSession>(key, userSession);

      return await apiResponseSuccess(this.i18nService, tokens);
    } catch {
      return await apiResponseFailure(this.i18nService, [
        {
          type: EApiResponseMessageType.Error,
          message: AuthErrorMessageConstants.invalidCredentials,
        },
      ]);
    }
  }
}

