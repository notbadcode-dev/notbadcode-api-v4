import { type MarkGroupLinksAsFavoriteRequest } from '@apps/links/src/application/requests';

export class MarkGroupLinksAsFavoriteCommand {
  constructor(
    public readonly request: MarkGroupLinksAsFavoriteRequest,
    public readonly userId: number,
  ) {}
}
