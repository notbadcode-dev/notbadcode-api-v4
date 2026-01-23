import { type UnmarkLinksAsFavoriteRequest } from '../requests/unmark-links-as-favorite.request';

export class UnmarkLinksAsFavoriteCommand {
  constructor(public readonly request: UnmarkLinksAsFavoriteRequest) {}
}
