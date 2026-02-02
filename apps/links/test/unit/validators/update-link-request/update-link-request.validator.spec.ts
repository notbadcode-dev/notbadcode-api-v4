import { validateSync } from 'class-validator';

import { UpdateLinkRequestValidatorFixture } from './update-link-request.fixture';

describe('UpdateLinkRequestValidator', () => {
  it('should pass validation for valid full request', () => {
    // Arrange
    const req = UpdateLinkRequestValidatorFixture.getValidFullRequest() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should pass validation for empty request (all fields optional)', () => {
    // Arrange
    const req = UpdateLinkRequestValidatorFixture.getValidEmptyRequest() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors).toHaveLength(0);
  });

  describe('url validation', () => {
    it('should fail for invalid url', () => {
      // Arrange
      const req = UpdateLinkRequestValidatorFixture.getInvalidUrlRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'url')).toBe(true);
    });

    it('should fail for too long url', () => {
      // Arrange
      const req = UpdateLinkRequestValidatorFixture.getTooLongUrlRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'url')).toBe(true);
    });
  });

  describe('title validation', () => {
    it('should fail for empty title', () => {
      // Arrange
      const req = UpdateLinkRequestValidatorFixture.getEmptyTitleRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });

    it('should fail for too long title', () => {
      // Arrange
      const req = UpdateLinkRequestValidatorFixture.getTooLongTitleRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });
  });

  describe('description validation', () => {
    it('should fail for too long description', () => {
      // Arrange
      const req = UpdateLinkRequestValidatorFixture.getTooLongDescriptionRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'description')).toBe(true);
    });
  });

  describe('isFavorite validation', () => {
    it('should fail for non-boolean isFavorite', () => {
      // Arrange
      const req = UpdateLinkRequestValidatorFixture.getInvalidFavoriteRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'isFavorite')).toBe(true);
    });
  });

  describe('tagList validation', () => {
    it('should fail for non-array tagList', () => {
      // Arrange
      const req = UpdateLinkRequestValidatorFixture.getNonArrayTagListRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'tagList')).toBe(true);
    });

    it('should fail for too many tags', () => {
      // Arrange
      const req = UpdateLinkRequestValidatorFixture.getTooManyTagsRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'tagList')).toBe(true);
    });

    it('should fail for non-string tags', () => {
      // Arrange
      const req = UpdateLinkRequestValidatorFixture.getTagListWithNonStringRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'tagList')).toBe(true);
    });

    it('should fail for tags exceeding max length', () => {
      // Arrange
      const req = UpdateLinkRequestValidatorFixture.getTagListWithTooLongTagRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'tagList')).toBe(true);
    });
  });
});
