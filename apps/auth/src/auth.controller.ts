import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse } from '@nestjs/swagger';

import { ApiResponse } from '@common/responses';

import { LoginCommand, LogoutCommand, RefreshCommand, RegisterCommand } from '@apps/auth/src/application/commands';
import { LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest } from '@apps/auth/src/application/requests';
import { LoginResponse } from '@apps/auth/src/application/responses';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @ApiOkResponse({ type: LoginResponse, description: 'User registered successfully' })
  async register(@Body() request: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    return this.commandBus.execute(new RegisterCommand(request.email, request.password));
  }

  @Post('login')
  @ApiOkResponse({ type: LoginResponse, description: 'User logged in successfully' })
  async login(@Body() request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.commandBus.execute(new LoginCommand(request.email, request.password));
  }

  @Post('logout')
  @ApiOkResponse({ description: 'User logged out successfully' })
  async logout(@Body() request: LogoutRequest): Promise<ApiResponse<null>> {
    return this.commandBus.execute(new LogoutCommand(request.accessToken));
  }

  @Post('refresh')
  @ApiOkResponse({ type: LoginResponse, description: 'User refresh token successfully' })
  async refresh(@Body() request: RefreshRequest): Promise<ApiResponse<LoginResponse>> {
    return this.commandBus.execute(new RefreshCommand(request.refreshToken));
  }
}
