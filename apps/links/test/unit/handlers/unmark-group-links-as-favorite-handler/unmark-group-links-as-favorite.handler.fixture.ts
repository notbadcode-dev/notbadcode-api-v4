 
import { type UnmarkGroupLinksAsFavoriteRequest } from '@apps/links/src/application/requests';
import { GroupLink } from '@apps/links/src/domain/entities';

export class UnmarkGroupLinksAsFavoriteHandlerFixture {
  static readonly validUserId = 7;

  static readonly existingIds = [1, 2, 3];

  static readonly nonExistentIds = [99, 100];

  static createRequest(overrides?: Partial<UnmarkGroupLinksAsFavoriteRequest>): UnmarkGroupLinksAsFavoriteRequest {
    return {
      groupLinkIdList: UnmarkGroupLinksAsFavoriteHandlerFixture.existingIds,
      ...overrides,
    };
  }

  static get existingGroupLinks(): GroupLink[] {
    return UnmarkGroupLinksAsFavoriteHandlerFixture.existingIds.map((id) =>
      Object.assign(new GroupLink(), {
        id,
        userId: UnmarkGroupLinksAsFavoriteHandlerFixture.validUserId,
        title: `Group ${id}`,
        isFavorite: true,
      }),
    );
  }
}
