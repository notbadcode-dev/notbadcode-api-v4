import { EPaginatedOrder } from '@common/enums/paginated-order.enum';
import { PaginatedRequest } from '@common/requests';

export class PaginateHelperFixture {
  static items(): number[] {
    return [1, 2, 3];
  }

  static total(): number {
    return 30;
  }

  static requestWithoutSkip(): PaginatedRequest {
    const request = new PaginatedRequest();
    request.currentPage = 2;
    request.take = 5;
    request.sortBy = 'createdAt';
    request.sortOrder = EPaginatedOrder.ASC;
    delete (request as Record<string, unknown>).skip;
    return request;
  }

  static requestWithSkip(): PaginatedRequest {
    const request = new PaginatedRequest();
    request.currentPage = 3;
    request.take = 10;
    request.skip = 30;
    request.sortBy = 'title';
    request.sortOrder = EPaginatedOrder.DESC;
    return request;
  }

  static requestWithoutSort(): PaginatedRequest {
    const request = new PaginatedRequest();
    request.currentPage = 0;
    request.take = 0;
    delete (request as Record<string, unknown>).skip;
    delete (request as Record<string, unknown>).sortBy;
    delete (request as Record<string, unknown>).sortOrder;
    return request;
  }
}
