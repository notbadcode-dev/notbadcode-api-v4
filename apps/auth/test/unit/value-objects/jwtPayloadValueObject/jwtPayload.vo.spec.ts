import { JwtPayload } from '@apps/auth/src/application/value-objects/jwt-payload.vo';
import { AuthErrorMessageConstants } from '@apps/auth/src/constants';

import { JwtPayloadFixture } from './jwtPayload.vo.fixture';

describe('JwtPayload', () => {
  describe('create', () => {
    it('should return error if userId is not a positive integer', () => {
      // Arrange
      const invalidUserId = JwtPayloadFixture.invalidUserId();
      const email = JwtPayloadFixture.validEmail();

      // Act
      const result = JwtPayload.create(invalidUserId, email);

      // Assert
      expect(result.isError).toBe(true);
      expect(result.isError ? result.errorMessage : '').toBe(AuthErrorMessageConstants.invalidUserId);
    });

    it('should return error if email is empty', () => {
      // Arrange
      const userId = JwtPayloadFixture.validUserId();
      const email = JwtPayloadFixture.emptyEmail();

      // Act
      const result = JwtPayload.create(userId, email);

      // Assert
      expect(result.isError).toBe(true);
      expect(result.isError ? result.errorMessage : '').toBe(AuthErrorMessageConstants.invalidEmail);
    });

    it('should return error if email does not match pattern', () => {
      // Arrange
      const userId = JwtPayloadFixture.validUserId();
      const email = JwtPayloadFixture.invalidEmail();

      // Act
      const result = JwtPayload.create(userId, email);

      // Assert
      expect(result.isError).toBe(true);
      expect(result.isError ? result.errorMessage : '').toBe(AuthErrorMessageConstants.invalidEmail);
    });

    it('should return success with JwtPayload if parameters are valid', () => {
      // Arrange
      const email = JwtPayloadFixture.validEmail();
      const userId = JwtPayloadFixture.validUserId();

      // Act
      const result = JwtPayload.create(userId, email);

      // Assert
      expect(result.isError).toBe(false);

      if (result.isError) {
        throw new Error('Expected result.success to be true');
      }

      expect(result.value.userId).toBe(userId);
      expect(result.value.email).toBe(email);
    });
  });

  describe('toPlainObject', () => {
    it('should return the plain object representation', () => {
      // Act
      const result = JwtPayload.create(JwtPayloadFixture.validUserId(), JwtPayloadFixture.validEmail());

      // Assert
      expect(result.isError).toBe(false);
      if (result.isError) {
        throw new Error('Expected result.success to be true');
      }

      expect(result.value.toPlainObject()).toEqual(JwtPayloadFixture.expectedPlainObject(result.value.jti));
    });
  });
});
