import { PaginatedConstants } from '@common/constants';
import { PaginateHelper } from '@common/helpers';

import { PaginateHelperFixture } from './paginate.helper.fixture';

describe('PaginateHelper', () => {
  describe('buildPaginatedResponse', () => {
    it('should compute page, take, and skip values when skip is not provided', () => {
      // Arrange
      const request = PaginateHelperFixture.requestWithoutSkip();
      const items = PaginateHelperFixture.items();
      const total = PaginateHelperFixture.total();

      // Act
      const result = PaginateHelper.buildPaginatedResponse({ items, total, request });

      // Assert
      expect(result).toEqual({
        items,
        total,
        take: request.take,
        skip: (request.currentPage - 1) * request.take,
        sortBy: request.sortBy,
        sortOrder: request.sortOrder,
        previousPage: 1,
        currentPage: request.currentPage,
        nextPage: 3,
      });
    });

    it('should respect explicit skip value in the request', () => {
      // Arrange
      const request = PaginateHelperFixture.requestWithSkip();
      const items = PaginateHelperFixture.items();
      const total = PaginateHelperFixture.total();

      // Act
      const result = PaginateHelper.buildPaginatedResponse({ items, total, request });

      // Assert
      expect(result.skip).toBe(request.skip);
      expect(result.take).toBe(request.take);
      expect(result.previousPage).toBe(2);
      expect(result.currentPage).toBe(request.currentPage);
      expect(result.nextPage).toBeUndefined();
    });
  });

  describe('calculateRepositoryPagination', () => {
    it('should return pagination options honoring provided sort fields', () => {
      // Arrange
      const request = PaginateHelperFixture.requestWithSkip();

      // Act
      const result = PaginateHelper.calculateRepositoryPagination(request);

      // Assert
      expect(result.skip).toBe(request.skip);
      expect(result.take).toBe(request.take);
      expect(result.order).toEqual({
        [request.sortBy]: request.sortOrder,
      });
    });

    it('should fall back to defaults when sortBy is missing and invalid values are provided', () => {
      // Arrange
      const request = PaginateHelperFixture.requestWithoutSort();

      // Act
      const result = PaginateHelper.calculateRepositoryPagination(request);

      // Assert
      expect(result.take).toBe(PaginatedConstants.DEFAULT_TAKE);
      expect(result.skip).toBe(0);
      expect(result.order).toEqual({
        [PaginatedConstants.DEFAULT_SORT_BY]: PaginatedConstants.DEFAULT_SORT_ORDER,
      });
    });
  });
});
