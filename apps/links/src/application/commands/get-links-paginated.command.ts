import { type UserPaginatedRequest } from '@common/requests/user-paginated-request';

export class GetLinksPaginatedCommand {
  constructor(public readonly request: UserPaginatedRequest) {}
}
