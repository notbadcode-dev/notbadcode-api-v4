import { UUID } from 'node:crypto';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { CommonSessionControlService } from '@common/redis/session';
import { UserSession } from '@common/redis/session/user-session.model';
import { ApiResponse } from '@common/responses';

import { RegisterCommand } from '@apps/auth/src/application/commands';
import { TokenValidationHelper } from '@apps/auth/src/application/helpers';
import { LoginResponse } from '@apps/auth/src/application/responses';
import { AuthService, HashService, UserService } from '@apps/auth/src/application/services';
import { JwtPayload } from '@apps/auth/src/application/value-objects';
import { AuthErrorMessageConstants } from '@apps/auth/src/constants';
import { User } from '@apps/auth/src/domain/entities';

@CommandHandler(RegisterCommand)
export class RegisterHandler extends BaseHandler<RegisterCommand, ApiResponse<LoginResponse>> implements ICommandHandler<RegisterCommand, ApiResponse<LoginResponse>> {
  /* istanbul ignore next */
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly commonSessionControlService: CommonSessionControlService,
    private readonly hashService: HashService,
    private readonly userService: UserService,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: RegisterCommand): Promise<ApiResponse<LoginResponse>> {
    const { email, password } = command;

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      return await this.createResponseFailure(AuthErrorMessageConstants.emailAlreadyExists);
    }

    const passwordHash = await this.hashService.hash(password);

    const user = this.userRepository.create({ email, passwordHash });
    const savedUser = await this.userRepository.save(user);

    const payloadResult = JwtPayload.create(savedUser.id, savedUser.email);
    if (payloadResult.isError) {
      return await this.createResponseFailure(payloadResult.errorMessage);
    }

    const payload = payloadResult.value;
    const tokens = await this.authService.generateTokens(payload);

    await this.setCacheSession(savedUser, payload.jti);

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
}
