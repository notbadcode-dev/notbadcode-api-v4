import { UUID } from 'node:crypto';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

  /* istanbul ignore next */
import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { CommonSessionControlService } from '@common/redis/session';
import { UserSession } from '@common/redis/session/user-session.model';
import { ApiResponse } from '@common/responses';

import { LoginCommand } from '@apps/auth/src/application/commands';
import { TokenValidationHelper } from '@apps/auth/src/application/helpers/token-validation.helper';
import { LoginResponse } from '@apps/auth/src/application/responses';
import { AuthService } from '@apps/auth/src/application/services/auth.service';
import { HashService } from '@apps/auth/src/application/services/hash.service';
import { UserService } from '@apps/auth/src/application/services/user.service';
import { JwtPayload } from '@apps/auth/src/application/value-objects';
import { AuthErrorMessageConstants } from '@apps/auth/src/constants/auth-error-message.constants';
import { User } from '@apps/auth/src/domain/entities';

@CommandHandler(LoginCommand)
export class LoginHandler extends BaseHandler<LoginCommand, ApiResponse<LoginResponse>> implements ICommandHandler<LoginCommand, ApiResponse<LoginResponse>> {
  constructor(
    /* istanbul ignore next */
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly commonSessionControlService: CommonSessionControlService,
    private readonly hashService: HashService,
    private readonly userService: UserService,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: LoginCommand): Promise<ApiResponse<LoginResponse>> {
    const { email, password } = command;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return await this.createResponseFailure(AuthErrorMessageConstants.invalidCredentials);
    }

    const passwordMatch = await this.hashService.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return await this.createResponseFailure(AuthErrorMessageConstants.invalidCredentials);
    }

    const payloadResult = JwtPayload.create(user.id, user.email);
    if (payloadResult.isError) {
      return this.createResponseFailure(payloadResult.errorMessage);
    }

    const payload = payloadResult.value;
    const tokens = await this.authService.generateTokens(payload);

    await this.addLastLoginAt(tokens, user);

    await this.setCacheSession(user, payload.jti);

    return await this.createSuccessResponse(tokens);
  }

  private async setCacheSession(user: User, jti: string): Promise<string | null> {
    const uuidResult = await TokenValidationHelper.validateUUID(jti);
    if (uuidResult.isError) {
      return null;
    }

    const userSession = this.userService.getUserSessionWithDate(user.id, jti as UUID);
    const userSessionKey = this.commonSessionControlService.getUserSessionKey(userSession);
    return await this.commonSessionControlService.setSession<UserSession>(userSessionKey, userSession);
  }

  private async addLastLoginAt(tokens: LoginResponse, user: User): Promise<void> {
    if (!user?.id || !tokens.accessToken?.length || !tokens.refreshToken.length) {
      return;
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
  }
}
