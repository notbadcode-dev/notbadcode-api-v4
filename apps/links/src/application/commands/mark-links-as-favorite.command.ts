import { type MarkLinksAsFavoriteRequest } from '@apps/links/src/application/requests';

export class MarkLinksAsFavoriteCommand {
  constructor(
    public readonly request: MarkLinksAsFavoriteRequest,
    public readonly userId: number,
  ) {}
}
