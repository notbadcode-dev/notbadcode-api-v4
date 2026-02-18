import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { SwaggerConstants } from '@common/constants';
import { CurrentAccessToken } from '@common/decorators';
import { ApiNullResponse, ApiResponse, createApiResponse } from '@common/responses';

import { LoginCommand, LogoutCommand, RefreshCommand, RegisterCommand } from '@apps/auth/src/application/commands';
import { LoginRequest, RefreshRequest, RegisterRequest } from '@apps/auth/src/application/requests';
import { LoginResponse } from '@apps/auth/src/application/responses';
import { AuthConstants } from '@apps/auth/src/constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: AuthConstants.throttle.defaultLimit, ttl: AuthConstants.throttle.defaultTtl } })
  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account and returns access and refresh tokens' })
  @ApiCreatedResponse({ type: createApiResponse(LoginResponse), description: 'User registered successfully' })
  @ApiBadRequestResponse({ description: SwaggerConstants.descriptions.invalidEmailOrPasswordFormat })
  async register(@Body() request: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    return this.commandBus.execute(new RegisterCommand(request.email, request.password));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: AuthConstants.throttle.defaultLimit, ttl: AuthConstants.throttle.defaultTtl } })
  @ApiOperation({ summary: 'Login', description: 'Authenticates a user and returns access and refresh tokens' })
  @ApiOkResponse({ type: createApiResponse(LoginResponse), description: 'User logged in successfully' })
  @ApiBadRequestResponse({ description: SwaggerConstants.descriptions.invalidEmailOrPasswordFormat })
  @ApiUnauthorizedResponse({ description: SwaggerConstants.descriptions.invalidCredentials })
  async login(@Body() request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.commandBus.execute(new LoginCommand(request.email, request.password));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout', description: 'Invalidates the current access token' })
  @ApiOkResponse({ type: ApiNullResponse, description: 'User logged out successfully' })
  @ApiUnauthorizedResponse({ description: SwaggerConstants.descriptions.invalidOrExpiredAccessToken })
  async logout(@CurrentAccessToken() accessToken: string): Promise<ApiResponse<null>> {
    return this.commandBus.execute(new LogoutCommand(accessToken));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh tokens', description: 'Generates new access and refresh tokens using a valid refresh token' })
  @ApiOkResponse({ type: createApiResponse(LoginResponse), description: 'Tokens refreshed successfully' })
  @ApiBadRequestResponse({ description: 'Invalid refresh token format' })
  @ApiUnauthorizedResponse({ description: SwaggerConstants.descriptions.invalidOrExpiredRefreshToken })
  async refresh(@Body() request: RefreshRequest): Promise<ApiResponse<LoginResponse>> {
    return this.commandBus.execute(new RefreshCommand(request.refreshToken));
  }
}
