import { validateSync } from 'class-validator';

import { RefreshRequestValidatorFixture } from './refresh-request.fixture';

describe('RefreshRequestValidator', () => {
  it('should pass validation for valid request', () => {
    // Arrange
    const req = RefreshRequestValidatorFixture.getValidRefreshRequest() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors).toHaveLength(0);
  });

  describe('refreshToken validation', () => {
    it('should fail for empty refreshToken', () => {
      // Arrange
      const req = RefreshRequestValidatorFixture.getEmptyRefreshTokenRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'refreshToken')).toBe(true);
    });

    it('should fail for non-string refreshToken', () => {
      // Arrange
      const req = RefreshRequestValidatorFixture.getNonStringRefreshTokenRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'refreshToken')).toBe(true);
    });

    it('should fail when refreshToken is missing', () => {
      // Arrange
      const req = RefreshRequestValidatorFixture.getMissingRefreshTokenRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'refreshToken')).toBe(true);
    });
  });
});
