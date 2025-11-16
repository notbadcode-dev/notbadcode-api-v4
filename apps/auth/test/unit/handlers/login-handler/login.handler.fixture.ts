import { BaseHandlerFixture } from '../base.handler.fixture';

export class LoginHandlerFixture extends BaseHandlerFixture {
  static invalidEmail(): string {
    return 'no@exists.com';
  }

  static invalidPassword(): string {
    return 'pwd';
  }
}
