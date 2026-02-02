import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CurrentAccessToken } from '@common/decorators';
import { ApiResponse } from '@common/responses';


import { LoginCommand, LogoutCommand, RefreshCommand, RegisterCommand } from '@apps/auth/src/application/commands';
import { LoginRequest, RefreshRequest, RegisterRequest } from '@apps/auth/src/application/requests';
import { LoginResponse } from '@apps/auth/src/application/responses';
import { AuthConstants } from '@apps/auth/src/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @Throttle({ default: { limit: AuthConstants.throttle.defaultLimit, ttl: AuthConstants.throttle.defaultTtl } })
  @ApiOkResponse({ type: LoginResponse, description: 'User registered successfully' })
  async register(@Body() request: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    return this.commandBus.execute(new RegisterCommand(request.email, request.password));
  }

  @Post('login')
  @Throttle({ default: { limit: AuthConstants.throttle.defaultLimit, ttl: AuthConstants.throttle.defaultTtl } })
  @ApiOkResponse({ type: LoginResponse })
  async login(@Body() request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.commandBus.execute(new LoginCommand(request.email, request.password));
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User logged out successfully' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  async logout(@CurrentAccessToken() accessToken: string): Promise<ApiResponse<null>> {
    return this.commandBus.execute(new LogoutCommand(accessToken));
  }

  @Post('refresh')
  @ApiOkResponse({ type: LoginResponse, description: 'User refresh token successfully' })
  async refresh(@Body() request: RefreshRequest): Promise<ApiResponse<LoginResponse>> {
    return this.commandBus.execute(new RefreshCommand(request.refreshToken));
  }
}
