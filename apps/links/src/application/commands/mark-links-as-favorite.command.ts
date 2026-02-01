import { type MarkLinksAsFavoriteRequest } from '../requests/mark-links-as-favorite.request';

export class MarkLinksAsFavoriteCommand {
  constructor(
    public readonly request: MarkLinksAsFavoriteRequest,
    public readonly userId: number,
  ) {}
}
