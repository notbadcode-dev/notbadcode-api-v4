import { RegisterRequest } from '@apps/auth/src/application/requests';

export class RegisterRequestValidatorFixture {
  static getValidRegisterRequest(): RegisterRequest {
    return Object.assign(new RegisterRequest(), {
      email: 'test@example.com',
      password: 'MyStrongPassword123!',
    });
  }

  static getInvalidEmailRegisterRequest(): RegisterRequest {
    return Object.assign(new RegisterRequest(), {
      email: 'invalid-email',
      password: 'MyStrongPassword123!',
    });
  }

  static getEmptyEmailRegisterRequest(): RegisterRequest {
    return Object.assign(new RegisterRequest(), {
      email: '',
      password: 'MyStrongPassword123!',
    });
  }

  static getTooShortPasswordRegisterRequest(): RegisterRequest {
    return Object.assign(new RegisterRequest(), {
      email: 'test@example.com',
      password: 'short',
    });
  }

  static getTooLongPasswordRegisterRequest(): RegisterRequest {
    return Object.assign(new RegisterRequest(), {
      email: 'test@example.com',
       
      password: 'a'.repeat(200),
    });
  }

  static getEmptyPasswordRegisterRequest(): RegisterRequest {
    return Object.assign(new RegisterRequest(), {
      email: 'test@example.com',
      password: '',
    });
  }
}
