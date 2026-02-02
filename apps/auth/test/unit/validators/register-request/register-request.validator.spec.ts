import { validateSync } from 'class-validator';

import { RegisterRequestValidatorFixture } from './register-request.fixture';

describe('RegisterRequestValidator', () => {
  it('should pass validation for valid request', () => {
    // Arrange
    const req = RegisterRequestValidatorFixture.getValidRegisterRequest() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors).toHaveLength(0);
  });

  describe('email validation', () => {
    it('should fail for invalid email', () => {
      // Arrange
      const req = RegisterRequestValidatorFixture.getInvalidEmailRegisterRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should fail for empty email', () => {
      // Arrange
      const req = RegisterRequestValidatorFixture.getEmptyEmailRegisterRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });
  });

  describe('password validation', () => {
    it('should fail for too short password', () => {
      // Arrange
      const req = RegisterRequestValidatorFixture.getTooShortPasswordRegisterRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail for too long password', () => {
      // Arrange
      const req = RegisterRequestValidatorFixture.getTooLongPasswordRegisterRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail for empty password', () => {
      // Arrange
      const req = RegisterRequestValidatorFixture.getEmptyPasswordRegisterRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });
  });
});
