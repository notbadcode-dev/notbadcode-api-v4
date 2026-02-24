import { PaginatedConstants } from '@common/constants';
import { EPaginatedOrder } from '@common/enums/paginated-order.enum';
import { PaginatedRequest } from '@common/requests';

describe('PaginatedRequest', () => {
  it('has expected default values', () => {
    const request = new PaginatedRequest();

    expect(request.skip).toBe(PaginatedConstants.DEFAULT_SKIP);
    expect(request.take).toBe(PaginatedConstants.DEFAULT_TAKE);
    expect(request.currentPage).toBe(PaginatedConstants.DEFAULT_FIRST_PAGE);
    expect(request.sortBy).toBe(PaginatedConstants.DEFAULT_SORT_BY);
    expect(request.sortOrder).toBe(EPaginatedOrder.DESC);
  });
});
