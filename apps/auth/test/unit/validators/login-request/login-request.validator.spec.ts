import { validateSync } from 'class-validator';

import { LoginRequestValidatorFixture } from './login-request.fixture';

describe('LoginRequestValidator', () => {
  it('should pass validation for valid request', () => {
    // Arrange
    const req = LoginRequestValidatorFixture.getValidLoginRequest() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors).toHaveLength(0);
  });

  describe('email validation', () => {
    it('should fail for invalid email', () => {
      // Arrange
      const req = LoginRequestValidatorFixture.getInvalidEmailLoginRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should fail for empty email', () => {
      // Arrange
      const req = LoginRequestValidatorFixture.getEmptyEmailLoginRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });
  });

  describe('password validation', () => {
    it('should fail for too short password', () => {
      // Arrange
      const req = LoginRequestValidatorFixture.getTooShortPasswordLoginRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail for too long password', () => {
      // Arrange
      const req = LoginRequestValidatorFixture.getTooLongPasswordLoginRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail for empty password', () => {
      // Arrange
      const req = LoginRequestValidatorFixture.getEmptyPasswordLoginRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });
  });
});
