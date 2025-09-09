import { UUID } from 'node:crypto';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { I18nService } from '@common/i18n';
import { CommonSessionControlService } from '@common/redis/session';
import { UserSession } from '@common/redis/session/userSession.model';
import { ApiResponse, ApiResponseService, apiResponseSuccess } from '@common/responses';

import { LoginCommand } from '@apps/auth/src/application/commands';
import { LoginResponseDto } from '@apps/auth/src/application/dtos';
import { TokenValidationHelper } from '@apps/auth/src/application/helpers/token-validation.helper';
import { JwtPayload } from '@apps/auth/src/application/value-objects';
import { AuthService } from '@apps/auth/src/auth.service';
import { User } from '@apps/auth/src/domain/entities';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly i18nService: I18nService,
    private readonly apiResponseService: ApiResponseService,
    private readonly commonSessionControlService: CommonSessionControlService,
  ) {}

  async execute(command: LoginCommand): Promise<ApiResponse<LoginResponseDto>> {
    const { email, password } = command;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return await TokenValidationHelper.invalidCredentials(this.i18nService);
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return await TokenValidationHelper.invalidCredentials(this.i18nService);
    }

    const payloadResult = JwtPayload.create(user.id, user.email, this.apiResponseService);
    if (!payloadResult.success) {
      return payloadResult;
    }

    const tokens = await this.authService.generateTokens(payloadResult.data);

    await this.addLastLoginAt(tokens, user);

    await this.setCacheSession(user, payloadResult.data.jti);

    return await apiResponseSuccess(this.i18nService, tokens);
  }

  private async setCacheSession(user: User, jti: string): Promise<string | null> {
    const uuidError = await TokenValidationHelper.validateUUID(jti, this.i18nService);
    if (uuidError) {
      return null;
    }

    const userSession: UserSession = {
      userId: user.id,
      sessionId: jti as UUID,
      loginAt: new Date().toISOString(),
    };
    const userSessionKey = this.commonSessionControlService.getUserSessionKey(userSession);
    return await this.commonSessionControlService.setSession<UserSession>(userSessionKey, userSession);
  }

  private async addLastLoginAt(tokens: LoginResponseDto, user: User) {
    if (!user?.id || !tokens.accessToken?.length || !tokens.refreshToken.length) {
      return;
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
  }
}
