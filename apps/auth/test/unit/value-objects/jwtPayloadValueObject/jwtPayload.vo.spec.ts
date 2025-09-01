import { type ApiResponseService } from '@common/responses';

import { MockApiResponseService } from '@test/utils/mocks/apiResponse.service.mock';
import { JwtPayload } from 'apps/auth/src/application/value-objects/jwt-payload.vo';

import { JwtPayloadFixture } from './jwtPayload.vo.fixture';

describe('JwtPayload', () => {
  describe('create', () => {
    let apiResponse: ApiResponseService;

    beforeEach(() => {
      apiResponse = MockApiResponseService.create();
    });

    it('should return error if userId is not a positive integer', () => {
      const result = JwtPayload.create(
        JwtPayloadFixture.invalidUserId(),
        JwtPayloadFixture.validEmail(),
        apiResponse,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(apiResponse.error).toHaveBeenCalledWith([JwtPayloadFixture.errors().invalidUserId]);
      expect(result.success).toBe(false);
    });

    it('should return error if email is empty', () => {
      const result = JwtPayload.create(
        JwtPayloadFixture.validUserId(),
        JwtPayloadFixture.emptyEmail(),
        apiResponse,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(apiResponse.error).toHaveBeenCalledWith([JwtPayloadFixture.errors().invalidEmail]);
      expect(result.success).toBe(false);
    });

    it('should return error if email does not match pattern', () => {
      const result = JwtPayload.create(
        JwtPayloadFixture.validUserId(),
        JwtPayloadFixture.invalidEmail(),
        apiResponse,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(apiResponse.error).toHaveBeenCalledWith([JwtPayloadFixture.errors().invalidEmail]);
      expect(result.success).toBe(false);
    });

    it('should return success with JwtPayload if parameters are valid', () => {
      const email = JwtPayloadFixture.validEmail();
      const userId = JwtPayloadFixture.validUserId();

      const result = JwtPayload.create(userId, email, apiResponse);

      expect(result.success).toBe(true);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(apiResponse.success).toHaveBeenCalled();

      if (!result.success) {
        throw new Error('Expected result.success to be true');
      }

      expect(result.data.userId).toBe(userId);
      expect(result.data.email).toBe(email);
    });
  });

  describe('toPlainObject', () => {
    it('should return the plain object representation', () => {
      const apiResponse = MockApiResponseService.create();

      const result = JwtPayload.create(
        JwtPayloadFixture.validUserId(),
        JwtPayloadFixture.validEmail(),
        apiResponse,
      );

      expect(result.success).toBe(true);
      if (!result.success) {
        throw new Error('Expected result.success to be true');
      }

      expect(result.data.toPlainObject()).toEqual(
        JwtPayloadFixture.expectedPlainObject(result.data.jti),
      );
    });
  });
});
