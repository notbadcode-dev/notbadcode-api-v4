import { RefreshRequest } from '@apps/auth/src/application/requests';

export class RefreshRequestValidatorFixture {
  static getValidRefreshRequest(): RefreshRequest {
    return Object.assign(new RefreshRequest(), {
      refreshToken: 'valid_refresh_token_value',
    });
  }

  static getEmptyRefreshTokenRequest(): RefreshRequest {
    return Object.assign(new RefreshRequest(), {
      refreshToken: '',
    });
  }

  static getNonStringRefreshTokenRequest(): RefreshRequest {
    return Object.assign(new RefreshRequest(), {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      refreshToken: 12345,
    });
  }

  static getMissingRefreshTokenRequest(): RefreshRequest {
    return new RefreshRequest();
  }
}
