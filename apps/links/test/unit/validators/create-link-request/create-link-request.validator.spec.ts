import { validateSync } from 'class-validator';

import { CreateLinkRequestValidatorFixture } from './create-link-request.fixture';

describe('CreateLinkRequestValidator', () => {
  it('should pass validation for valid full request', () => {
    // Arrange
    const req = CreateLinkRequestValidatorFixture.getValidFullRequest() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should pass validation for minimal request (url only)', () => {
    // Arrange
    const req = CreateLinkRequestValidatorFixture.getValidMinimalRequest() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should fail when url is missing', () => {
    // Arrange
    const req = CreateLinkRequestValidatorFixture.getMissingUrlRequest() as object;

    // Act
    const errors = validateSync(req);

    // Assert
    expect(errors.some((e) => e.property === 'url')).toBe(true);
  });

  describe('url validation', () => {
    it('should fail for invalid url', () => {
      // Arrange
      const req = CreateLinkRequestValidatorFixture.getInvalidUrlRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'url')).toBe(true);
    });

    it('should fail for too long url', () => {
      // Arrange
      const req = CreateLinkRequestValidatorFixture.getTooLongUrlRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'url')).toBe(true);
    });
  });

  describe('title validation', () => {
    it('should fail for empty title', () => {
      // Arrange
      const req = CreateLinkRequestValidatorFixture.getEmptyTitleRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });

    it('should fail for too long title', () => {
      // Arrange
      const req = CreateLinkRequestValidatorFixture.getTooLongTitleRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });
  });

  describe('description validation', () => {
    it('should fail for too long description', () => {
      // Arrange
      const req = CreateLinkRequestValidatorFixture.getTooLongDescriptionRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'description')).toBe(true);
    });
  });

  describe('isFavorite validation', () => {
    it('should fail for non-boolean isFavorite', () => {
      // Arrange
      const req = CreateLinkRequestValidatorFixture.getInvalidFavoriteRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'isFavorite')).toBe(true);
    });
  });

  describe('tagList validation', () => {
    it('should fail for non-array tagList', () => {
      // Arrange
      const req = CreateLinkRequestValidatorFixture.getNonArrayTagListRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'tagList')).toBe(true);
    });

    it('should fail for too many tags', () => {
      // Arrange
      const req = CreateLinkRequestValidatorFixture.getTooManyTagsRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'tagList')).toBe(true);
    });

    it('should fail for non-string tags', () => {
      // Arrange
      const req = CreateLinkRequestValidatorFixture.getTagListWithNonStringRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'tagList')).toBe(true);
    });

    it('should fail for tags exceeding max length', () => {
      // Arrange
      const req = CreateLinkRequestValidatorFixture.getTagListWithTooLongTagRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'tagList')).toBe(true);
    });
  });

  describe('groupLinkId validation', () => {
    it('should fail for groupLinkId less than 1', () => {
      // Arrange
      const req = CreateLinkRequestValidatorFixture.getInvalidGroupLinkIdRequest() as object;

      // Act
      const errors = validateSync(req);

      // Assert
      expect(errors.some((e) => e.property === 'groupLinkId')).toBe(true);
    });
  });
});
