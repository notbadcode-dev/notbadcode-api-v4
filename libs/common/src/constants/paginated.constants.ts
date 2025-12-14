import { EPaginatedOrder } from '@common/enums';

/* eslint-disable @typescript-eslint/no-magic-numbers */
export const PaginatedConstants = {
  DEFAULT_SKIP: 0,
  DEFAULT_FIRST_PAGE: 1,
  DEFAULT_TAKE: 10,
  DEFAULT_TOTAL_ITEMS: 0,

  DEFAULT_SORT_BY: 'id',
  DEFAULT_SORT_ORDER: EPaginatedOrder.DESC,
};
