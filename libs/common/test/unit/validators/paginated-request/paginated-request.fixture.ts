import { EPaginatedOrder } from '@common/enums/paginated-order.enum';
import { PaginatedRequest } from '@common/requests';

export class PaginatedRequestValidatorFixture {
  static getValidPaginatedRequest(): PaginatedRequest {
    return Object.assign(new PaginatedRequest(), {
      skip: 0,
      take: 10,
      currentPage: 1,
      sortBy: 'id',
      sortOrder: EPaginatedOrder.DESC,
    });
  }

  static getValidPaginatedRequestWithDefaults(): PaginatedRequest {
    return new PaginatedRequest();
  }

  static getNegativeSkipPaginatedRequest(): PaginatedRequest {
    return Object.assign(new PaginatedRequest(), {
      skip: -1,
    });
  }

  static getZeroTakePaginatedRequest(): PaginatedRequest {
    return Object.assign(new PaginatedRequest(), {
      take: 0,
    });
  }

  static getNegativeTakePaginatedRequest(): PaginatedRequest {
    return Object.assign(new PaginatedRequest(), {
      take: -5,
    });
  }

  static getZeroCurrentPagePaginatedRequest(): PaginatedRequest {
    return Object.assign(new PaginatedRequest(), {
      currentPage: 0,
    });
  }

  static getNegativeCurrentPagePaginatedRequest(): PaginatedRequest {
    return Object.assign(new PaginatedRequest(), {
      currentPage: -1,
    });
  }

  static getInvalidSortOrderPaginatedRequest(): PaginatedRequest {
    return Object.assign(new PaginatedRequest(), {
      sortOrder: 'INVALID' as EPaginatedOrder,
    });
  }
}
