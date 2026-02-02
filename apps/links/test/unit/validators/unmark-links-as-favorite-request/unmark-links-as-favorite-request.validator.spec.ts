import { validateSync } from 'class-validator';

import { UnmarkLinksAsFavoriteRequestValidatorFixture } from './unmark-links-as-favorite-request.fixture';

describe('UnmarkLinksAsFavoriteRequestValidator', () => {
  it('should pass validation for valid request', () => {
    // Arrange
    const req = UnmarkLinksAsFavoriteRequestValidatorFixture.getValidRequest() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors).toHaveLength(0);
  });

  describe('linkIdList validation', () => {
    it('should fail for empty array', () => {
      // Arrange
      const req = UnmarkLinksAsFavoriteRequestValidatorFixture.getEmptyArrayRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'linkIdList')).toBe(true);
    });

    it('should fail for non-array value', () => {
      // Arrange
      const req = UnmarkLinksAsFavoriteRequestValidatorFixture.getNonArrayRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'linkIdList')).toBe(true);
    });

    it('should fail for array with non-integer values', () => {
      // Arrange
      const req = UnmarkLinksAsFavoriteRequestValidatorFixture.getArrayWithNonIntegersRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'linkIdList')).toBe(true);
    });

    it('should fail for array with string values', () => {
      // Arrange
      const req = UnmarkLinksAsFavoriteRequestValidatorFixture.getArrayWithStringsRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'linkIdList')).toBe(true);
    });

    it('should fail when linkIdList is missing', () => {
      // Arrange
      const req = UnmarkLinksAsFavoriteRequestValidatorFixture.getMissingFieldRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'linkIdList')).toBe(true);
    });
  });
});
