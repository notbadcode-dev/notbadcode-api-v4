import { type UserPaginatedRequest } from '@common/requests/user-paginated-request';

export class GetLinksPaginatedQuery {
  constructor(public readonly request: UserPaginatedRequest) {}
}
