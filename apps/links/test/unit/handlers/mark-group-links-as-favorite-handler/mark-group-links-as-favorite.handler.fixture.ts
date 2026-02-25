 
import { type MarkGroupLinksAsFavoriteRequest } from '@apps/links/src/application/requests';
import { GroupLink } from '@apps/links/src/domain/entities';

export class MarkGroupLinksAsFavoriteHandlerFixture {
  static readonly validUserId = 7;

  static readonly existingIds = [1, 2, 3];

  static readonly nonExistentIds = [99, 100];

  static createRequest(overrides?: Partial<MarkGroupLinksAsFavoriteRequest>): MarkGroupLinksAsFavoriteRequest {
    return {
      groupLinkIdList: MarkGroupLinksAsFavoriteHandlerFixture.existingIds,
      ...overrides,
    };
  }

  static get existingGroupLinks(): GroupLink[] {
    return MarkGroupLinksAsFavoriteHandlerFixture.existingIds.map((id) =>
      Object.assign(new GroupLink(), {
        id,
        userId: MarkGroupLinksAsFavoriteHandlerFixture.validUserId,
        title: `Group ${id}`,
        isFavorite: false,
      }),
    );
  }
}
