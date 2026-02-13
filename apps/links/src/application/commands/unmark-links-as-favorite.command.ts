import { type UnmarkLinksAsFavoriteRequest } from '@apps/links/src/application/requests';

export class UnmarkLinksAsFavoriteCommand {
  constructor(
    public readonly request: UnmarkLinksAsFavoriteRequest,
    public readonly userId: number,
  ) {}
}
