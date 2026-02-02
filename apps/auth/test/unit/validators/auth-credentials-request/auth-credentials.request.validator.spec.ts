import { validateSync } from 'class-validator';

import { AuthCredentialsRequestValidatorFixture } from './auth-credentials.request.fixture';

describe('AuthCredentialsRequestValidator', () => {
  it('should pass validation for valid request', () => {
    // Arrange
    const req = AuthCredentialsRequestValidatorFixture.getValidAuthCredentialsRequest() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors).toHaveLength(0);
  });

  describe('email validation', () => {
    it('should fail for invalid email', () => {
      // Arrange
      const req = AuthCredentialsRequestValidatorFixture.getInvalidEmailAuthCredentialsRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should fail for empty email', () => {
      // Arrange
      const req = AuthCredentialsRequestValidatorFixture.getEmptyEmailAuthCredentialsRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });
  });

  describe('password validation', () => {
    it('should fail for too short password', () => {
      // Arrange
      const req = AuthCredentialsRequestValidatorFixture.getTooShortPasswordAuthCredentialsRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail for too long password', () => {
      // Arrange
      const req = AuthCredentialsRequestValidatorFixture.getTooLongPasswordAuthCredentialsRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail for empty password', () => {
      // Arrange
      const req = AuthCredentialsRequestValidatorFixture.getEmptyPasswordAuthCredentialsRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });
  });
});
