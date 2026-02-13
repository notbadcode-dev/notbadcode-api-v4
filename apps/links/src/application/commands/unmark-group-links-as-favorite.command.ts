import { type UnmarkGroupLinksAsFavoriteRequest } from '@apps/links/src/application/requests';

export class UnmarkGroupLinksAsFavoriteCommand {
  constructor(
    public readonly request: UnmarkGroupLinksAsFavoriteRequest,
    public readonly userId: number,
  ) {}
}
