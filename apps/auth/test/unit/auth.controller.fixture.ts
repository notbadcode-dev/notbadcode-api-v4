import { type LoginRequest, type RefreshRequest, type RegisterRequest } from '@apps/auth/src/application/requests';
import { LoginResponse } from '@apps/auth/src/application/responses';

export class AuthControllerFixture {
  static readonly loginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123',
  };

  static readonly registerRequest: RegisterRequest = {
    email: 'new@example.com',
    password: 'password123',
  };

  static readonly logoutAccessToken = 'access-token';

  static readonly refreshRequest: RefreshRequest = {
    refreshToken: 'refresh-token',
  };

  static readonly loginResponse: LoginResponse = new LoginResponse(
    'access-token',
    'refresh-token',
  );
}
