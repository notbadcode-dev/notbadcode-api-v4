import { UUID } from 'node:crypto';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { PatternConstants } from '@common/constants';
import { I18nService } from '@common/i18n';
import { CommonSessionControlService } from '@common/redis/session';
import { UserSession } from '@common/redis/session/userSession.model';
import {
  ApiFailureResponse,
  ApiResponse,
  apiResponseFailure,
  ApiResponseService,
  apiResponseSuccess,
  EApiResponseMessageType,
} from '@common/responses';

import { AuthService } from '../../auth.service';
import { AuthErrorMessageConstants } from '../../constants';
import { User } from '../../domain/entities/user.entity';
import { LoginCommand } from '../commands';
import { LoginResponseDto } from '../dtos';
import { JwtPayload } from '../value-objects';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly i18nService: I18nService,
    private readonly apiResponseService: ApiResponseService,
    private readonly commonSessionControlService: CommonSessionControlService,
  ) {}

  async execute(command: LoginCommand): Promise<ApiResponse<LoginResponseDto>> {
    const { email, password } = command;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return this.returnInvalidCredentials();
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return this.returnInvalidCredentials();
    }

    const payloadResult = JwtPayload.create(user.id, user.email, this.apiResponseService);
    if (!payloadResult.success) {
      return payloadResult;
    }

    const tokens = await this.authService.generateTokens(payloadResult.data);

    await this.addLastLoginAt(tokens, user);

    await this.setCacheSession(user, tokens);

    return await apiResponseSuccess(this.i18nService, tokens);
  }

  private async setCacheSession(user: User, tokens: LoginResponseDto): Promise<string | null> {
    const decoded: { jti?: string } | null = this.jwtService.decode(tokens.accessToken);

    if (!decoded?.jti) {
      return null;
    }

    const validateUUID = PatternConstants.validationUUID.test(decoded?.jti);

    if (!validateUUID) {
      return null;
    }

    const userSession: UserSession = {
      userId: user.id,
      sessionId: decoded.jti as UUID,
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

  private async returnInvalidCredentials(): Promise<ApiFailureResponse> {
    return await apiResponseFailure(this.i18nService, [
      {
        type: EApiResponseMessageType.Error,
        message: AuthErrorMessageConstants.invalidCredentials,
      },
    ]);
  }
}
