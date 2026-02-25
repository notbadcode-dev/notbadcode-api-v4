import { AuthCredentialsRequest } from '@apps/auth/src/application/requests';

export class AuthCredentialsRequestValidatorFixture {
  static getValidAuthCredentialsRequest(): AuthCredentialsRequest {
    return Object.assign(new AuthCredentialsRequest(), {
      email: 'test@test.com',
      password: 'MyStrongPassword123!',
    });
  }

  static getInvalidEmailAuthCredentialsRequest(): AuthCredentialsRequest {
    return Object.assign(new AuthCredentialsRequest(), {
      email: 'invalid-email',
      password: 'MyStrongPassword123!',
    });
  }

  static getEmptyEmailAuthCredentialsRequest(): AuthCredentialsRequest {
    return Object.assign(new AuthCredentialsRequest(), {
      email: '',
      password: 'MyStrongPassword123!',
    });
  }

  static getTooShortPasswordAuthCredentialsRequest(): AuthCredentialsRequest {
    return Object.assign(new AuthCredentialsRequest(), {
      email: 'test@test.com',
      password: 'short',
    });
  }

  static getTooLongPasswordAuthCredentialsRequest(): AuthCredentialsRequest {
    return Object.assign(new AuthCredentialsRequest(), {
      email: 'test@test.com',
       
      password: 'a'.repeat(200),
    });
  }

  static getEmptyPasswordAuthCredentialsRequest(): AuthCredentialsRequest {
    return Object.assign(new AuthCredentialsRequest(), {
      email: 'test@test.com',
      password: '',
    });
  }
}
