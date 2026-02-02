import { validateSync } from 'class-validator';

import { PaginatedRequestValidatorFixture } from './paginated-request.fixture';

describe('PaginatedRequestValidator', () => {
  it('should pass validation for valid request', () => {
    // Arrange
    const req = PaginatedRequestValidatorFixture.getValidPaginatedRequest() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with default values', () => {
    // Arrange
    const req = PaginatedRequestValidatorFixture.getValidPaginatedRequestWithDefaults() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors).toHaveLength(0);
  });

  describe('skip validation', () => {
    it('should fail for negative skip', () => {
      // Arrange
      const req = PaginatedRequestValidatorFixture.getNegativeSkipPaginatedRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'skip')).toBe(true);
    });
  });

  describe('take validation', () => {
    it('should fail for zero take', () => {
      // Arrange
      const req = PaginatedRequestValidatorFixture.getZeroTakePaginatedRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'take')).toBe(true);
    });

    it('should fail for negative take', () => {
      // Arrange
      const req = PaginatedRequestValidatorFixture.getNegativeTakePaginatedRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'take')).toBe(true);
    });
  });

  describe('currentPage validation', () => {
    it('should fail for zero currentPage', () => {
      // Arrange
      const req = PaginatedRequestValidatorFixture.getZeroCurrentPagePaginatedRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'currentPage')).toBe(true);
    });

    it('should fail for negative currentPage', () => {
      // Arrange
      const req = PaginatedRequestValidatorFixture.getNegativeCurrentPagePaginatedRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'currentPage')).toBe(true);
    });
  });

  describe('sortOrder validation', () => {
    it('should fail for invalid sortOrder', () => {
      // Arrange
      const req = PaginatedRequestValidatorFixture.getInvalidSortOrderPaginatedRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'sortOrder')).toBe(true);
    });
  });
});
