import { PaginatedResponse, createPaginatedResponse } from '@common/responses';

import { PaginatedResponseFixture, SampleModel } from './paginated-response.fixture';

describe('PaginatedResponse', () => {
  it('should hold the provided pagination fields', () => {
    // Arrange
    const data = PaginatedResponseFixture.paginatedData(['a', 'b']);
    const response = Object.assign(new PaginatedResponse<string>(), data);

    // Assert
    expect(response.items).toEqual(data.items);
    expect(response.total).toBe(data.total);
    expect(response.page).toBe(data.page);
    expect(response.take).toBe(data.take);
    expect(response.skip).toBe(data.skip);
    expect(response.sortBy).toBe(data.sortBy);
    expect(response.sortOrder).toBe(data.sortOrder);
    expect(response.filters).toEqual(data.filters);
    expect(response.previousPage).toBe(data.previousPage);
    expect(response.currentPage).toBe(data.currentPage);
    expect(response.nextPage).toBe(data.nextPage);
  });

  it('should build a paginated response class for a model', () => {
    // Arrange
    const ModelClass = PaginatedResponseFixture.modelClass();
    const PaginatedModelResponse = createPaginatedResponse(ModelClass);
    const items = PaginatedResponseFixture.sampleModelList();
    const data = PaginatedResponseFixture.paginatedData(items);
    const response = Object.assign(new PaginatedModelResponse(), data);

    // Assert
    expect(response.items).toHaveLength(items.length);
    response.items.forEach((item, index) => {
      expect(item).toBeInstanceOf(SampleModel);
      expect(item.value).toBe(items[index].value);
    });

    expect(response.total).toBe(data.total);
    expect(response.page).toBe(data.page);
    expect(response.take).toBe(data.take);
    expect(response.skip).toBe(data.skip);
    expect(response.sortBy).toBe(data.sortBy);
    expect(response.sortOrder).toBe(data.sortOrder);
    expect(response.previousPage).toBe(data.previousPage);
    expect(response.currentPage).toBe(data.currentPage);
    expect(response.nextPage).toBe(data.nextPage);
  });
});
