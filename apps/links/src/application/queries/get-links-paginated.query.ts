import { type PaginatedRequest } from '@common/requests';

export class GetLinksPaginatedQuery {
  constructor(
    public readonly request: PaginatedRequest,
    public readonly userId: number,
  ) {}
}
