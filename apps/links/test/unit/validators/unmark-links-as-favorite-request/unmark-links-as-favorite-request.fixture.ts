import { UnmarkLinksAsFavoriteRequest } from '@apps/links/src/application/requests/unmark-links-as-favorite.request';

export class UnmarkLinksAsFavoriteRequestValidatorFixture {
  static getValidRequest(): UnmarkLinksAsFavoriteRequest {
    return Object.assign(new UnmarkLinksAsFavoriteRequest(), {
      linkIdList: [1, 2, 3],
    });
  }

  static getEmptyArrayRequest(): UnmarkLinksAsFavoriteRequest {
    return Object.assign(new UnmarkLinksAsFavoriteRequest(), {
      linkIdList: [],
    });
  }

  static getNonArrayRequest(): UnmarkLinksAsFavoriteRequest {
    return Object.assign(new UnmarkLinksAsFavoriteRequest(), {
      linkIdList: 'not-an-array',
    });
  }

  static getArrayWithNonIntegersRequest(): UnmarkLinksAsFavoriteRequest {
    return Object.assign(new UnmarkLinksAsFavoriteRequest(), {
      linkIdList: [1.5, 2.7],
    });
  }

  static getArrayWithStringsRequest(): UnmarkLinksAsFavoriteRequest {
    return Object.assign(new UnmarkLinksAsFavoriteRequest(), {
      linkIdList: ['a', 'b'],
    });
  }

  static getMissingFieldRequest(): UnmarkLinksAsFavoriteRequest {
    return new UnmarkLinksAsFavoriteRequest();
  }
}
