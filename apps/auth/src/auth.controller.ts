import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse } from '@nestjs/swagger';

import { ApiResponse } from '@common/responses';

import {
  LoginCommand,
  LogoutCommand,
  RefreshCommand,
  RegisterCommand,
} from '@apps/auth/src/application/commands';
import { LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest } from '@apps/auth/src/application/requests';
import { LoginResponse } from '@apps/auth/src/application/responses';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @ApiOkResponse()
  async register(@Body() dto: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    return this.commandBus.execute(new RegisterCommand(dto.email, dto.password));
  }

  @Post('login')
  @ApiOkResponse()
  async login(@Body() dto: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
  }

  @Post('logout')
  @ApiOkResponse()
  async logout(@Body() dto: LogoutRequest): Promise<ApiResponse<null>> {
    return this.commandBus.execute(new LogoutCommand(dto.accessToken));
  }

  @Post('refresh')
  @ApiOkResponse()
  async refresh(@Body() dto: RefreshRequest): Promise<ApiResponse<LoginResponse>> {
    return this.commandBus.execute(new RefreshCommand(dto.refreshToken));
  }
}
