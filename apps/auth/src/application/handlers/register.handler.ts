import { UUID } from 'node:crypto';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { I18nService } from '@common/i18n';
import { CommonSessionControlService } from '@common/redis/session';
import { UserSession } from '@common/redis/session/userSession.model';
import {
  ApiResponse,
  ApiResponseService,
  apiResponseFailure,
  apiResponseSuccess,
  EApiResponseMessageType,
} from '@common/responses';

import { RegisterCommand } from '@apps/auth/src/application/commands/register.command';
import { LoginResponseDto } from '@apps/auth/src/application/dtos';
import { TokenValidationHelper } from '@apps/auth/src/application/helpers/token-validation.helper';
import { JwtPayload } from '@apps/auth/src/application/value-objects';
import { AuthService } from '@apps/auth/src/auth.service';
import { AuthErrorMessageConstants } from '@apps/auth/src/constants';
import { User } from '@apps/auth/src/domain/entities';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly i18nService: I18nService,
    private readonly apiResponseService: ApiResponseService,
    private readonly commonSessionControlService: CommonSessionControlService,
  ) {}

  async execute(command: RegisterCommand): Promise<ApiResponse<LoginResponseDto>> {
    const { email, password } = command;

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      return await apiResponseFailure(this.i18nService, [
        { type: EApiResponseMessageType.Error, message: AuthErrorMessageConstants.emailAlreadyExists },
      ]);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({ email, passwordHash });
    const savedUser = await this.userRepository.save(user);

    const payloadResult = JwtPayload.create(savedUser.id, savedUser.email, this.apiResponseService);
    if (!payloadResult.success) {
      return payloadResult;
    }

    const tokens = await this.authService.generateTokens(payloadResult.data);

    await this.addLastLoginAt(tokens, savedUser);

    await this.setCacheSession(savedUser, payloadResult.data.jti);

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

  private async addLastLoginAt(tokens: LoginResponseDto, user: User): Promise<void> {
    if (!user?.id || !tokens.accessToken?.length || !tokens.refreshToken.length) {
      return;
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
  }
}
