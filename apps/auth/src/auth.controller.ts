import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse } from '@nestjs/swagger';

import { ApiResponse } from '@common/responses';

import { LoginCommand, LogoutCommand, RefreshCommand } from '@apps/auth/src/application/commands';
import { LoginRequestDto, LoginResponseDto, LogoutRequestDto, RefreshRequestDto } from '@apps/auth/src/application/dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  @ApiOkResponse({ type: LoginResponseDto })
  async login(@Body() dto: LoginRequestDto): Promise<ApiResponse<LoginResponseDto>> {
    return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
  }

  @Post('logout')
  @ApiOkResponse()
  async logout(@Body() dto: LogoutRequestDto): Promise<ApiResponse<null>> {
    return this.commandBus.execute(new LogoutCommand(dto.accessToken));
  }
  
  @Post('refresh')
  @ApiOkResponse({ type: LoginResponseDto })
  async refresh(@Body() dto: RefreshRequestDto): Promise<ApiResponse<LoginResponseDto>> {
    return this.commandBus.execute(new RefreshCommand(dto.accessToken));
  }
}
