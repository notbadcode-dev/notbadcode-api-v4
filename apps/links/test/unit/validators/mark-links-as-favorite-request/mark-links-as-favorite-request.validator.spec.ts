import { validateSync } from 'class-validator';

import { MarkLinksAsFavoriteRequestValidatorFixture } from './mark-links-as-favorite-request.fixture';

describe('MarkLinksAsFavoriteRequestValidator', () => {
  it('should pass validation for valid request', () => {
    // Arrange
    const req = MarkLinksAsFavoriteRequestValidatorFixture.getValidRequest() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors).toHaveLength(0);
  });

  describe('linkIdList validation', () => {
    it('should fail for empty array', () => {
      // Arrange
      const req = MarkLinksAsFavoriteRequestValidatorFixture.getEmptyArrayRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'linkIdList')).toBe(true);
    });

    it('should fail for non-array value', () => {
      // Arrange
      const req = MarkLinksAsFavoriteRequestValidatorFixture.getNonArrayRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'linkIdList')).toBe(true);
    });

    it('should fail for array with non-integer values', () => {
      // Arrange
      const req = MarkLinksAsFavoriteRequestValidatorFixture.getArrayWithNonIntegersRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'linkIdList')).toBe(true);
    });

    it('should fail for array with string values', () => {
      // Arrange
      const req = MarkLinksAsFavoriteRequestValidatorFixture.getArrayWithStringsRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'linkIdList')).toBe(true);
    });

    it('should fail when linkIdList is missing', () => {
      // Arrange
      const req = MarkLinksAsFavoriteRequestValidatorFixture.getMissingFieldRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'linkIdList')).toBe(true);
    });
  });
});
