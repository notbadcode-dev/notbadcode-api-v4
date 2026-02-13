import { type PaginatedRequest } from '@common/requests';

export class GetGroupLinksPaginatedQuery {
  constructor(
    public readonly request: PaginatedRequest,
    public readonly userId: number,
  ) {}
}
