import { LoginRequest } from '@apps/auth/src/application/requests';

export class LoginRequestValidatorFixture {
  static getValidLoginRequest(): LoginRequest {
    return Object.assign(new LoginRequest(), {
      email: 'test@example.com',
      password: 'MyStrongPassword123!',
    });
  }

  static getInvalidEmailLoginRequest(): LoginRequest {
    return Object.assign(new LoginRequest(), {
      email: 'invalid-email',
      password: 'MyStrongPassword123!',
    });
  }

  static getEmptyEmailLoginRequest(): LoginRequest {
    return Object.assign(new LoginRequest(), {
      email: '',
      password: 'MyStrongPassword123!',
    });
  }

  static getTooShortPasswordLoginRequest(): LoginRequest {
    return Object.assign(new LoginRequest(), {
      email: 'test@example.com',
      password: 'short',
    });
  }

  static getTooLongPasswordLoginRequest(): LoginRequest {
    return Object.assign(new LoginRequest(), {
      email: 'test@example.com',
       
      password: 'a'.repeat(200),
    });
  }

  static getEmptyPasswordLoginRequest(): LoginRequest {
    return Object.assign(new LoginRequest(), {
      email: 'test@example.com',
      password: '',
    });
  }
}
