import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { I18nService } from '@common/i18n';
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
    private readonly i18nService: I18nService,
    private readonly apiResponseService: ApiResponseService,
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

    await this.AddLastLoginAt(tokens, user);

    return await apiResponseSuccess(this.i18nService, tokens);
  }

  private async AddLastLoginAt(tokens: LoginResponseDto, user: User) {
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
