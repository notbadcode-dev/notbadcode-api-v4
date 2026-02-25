 
import { CommandBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';

import { LoginCommand, LogoutCommand, RefreshCommand, RegisterCommand } from '@apps/auth/src/application/commands';
import { AuthController } from '@apps/auth/src/auth.controller';

import { AuthControllerFixture } from './auth.controller.fixture';

describe('AuthController', () => {
  let controller: AuthController;
  let commandBus: jest.Mocked<CommandBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: CommandBus, useValue: { execute: jest.fn() } }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    commandBus = module.get(CommandBus);
  });

  describe('login', () => {
    it('should execute LoginCommand with email and password', async () => {
      // Arrange
      const request = AuthControllerFixture.loginRequest;
      commandBus.execute.mockResolvedValueOnce(AuthControllerFixture.loginResponse);

      // Act
      const result = await controller.login(request);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(new LoginCommand(request.email, request.password));
      expect(result).toEqual(AuthControllerFixture.loginResponse);
    });
  });

  describe('register', () => {
    it('should execute RegisterCommand with email and password', async () => {
      // Arrange
      const request = AuthControllerFixture.registerRequest;
      commandBus.execute.mockResolvedValueOnce(AuthControllerFixture.loginResponse);

      // Act
      const result = await controller.register(request);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(new RegisterCommand(request.email, request.password));
      expect(result).toEqual(AuthControllerFixture.loginResponse);
    });
  });

  describe('logout', () => {
    it('should execute LogoutCommand with accessToken', async () => {
      // Arrange
      const accessToken = AuthControllerFixture.logoutAccessToken;
      const expectedResponse = { success: true, data: null };
      commandBus.execute.mockResolvedValueOnce(expectedResponse);

      // Act
      const result = await controller.logout(accessToken);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(new LogoutCommand(accessToken));
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('refresh', () => {
    it('should execute RefreshCommand with refreshToken', async () => {
      // Arrange
      const request = AuthControllerFixture.refreshRequest;
      commandBus.execute.mockResolvedValueOnce(AuthControllerFixture.loginResponse);

      // Act
      const result = await controller.refresh(request);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(new RefreshCommand(request.refreshToken));
      expect(result).toEqual(AuthControllerFixture.loginResponse);
    });
  });
});
