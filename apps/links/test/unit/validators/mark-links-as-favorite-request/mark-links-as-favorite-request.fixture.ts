import { MarkLinksAsFavoriteRequest } from '@apps/links/src/application/requests/mark-links-as-favorite.request';

export class MarkLinksAsFavoriteRequestValidatorFixture {
  static getValidRequest(): MarkLinksAsFavoriteRequest {
    return Object.assign(new MarkLinksAsFavoriteRequest(), {
      linkIdList: [1, 2, 3],
    });
  }

  static getEmptyArrayRequest(): MarkLinksAsFavoriteRequest {
    return Object.assign(new MarkLinksAsFavoriteRequest(), {
      linkIdList: [],
    });
  }

  static getNonArrayRequest(): MarkLinksAsFavoriteRequest {
    return Object.assign(new MarkLinksAsFavoriteRequest(), {
      linkIdList: 'not-an-array',
    });
  }

  static getArrayWithNonIntegersRequest(): MarkLinksAsFavoriteRequest {
    return Object.assign(new MarkLinksAsFavoriteRequest(), {
      linkIdList: [1.5, 2.7],
    });
  }

  static getArrayWithStringsRequest(): MarkLinksAsFavoriteRequest {
    return Object.assign(new MarkLinksAsFavoriteRequest(), {
      linkIdList: ['a', 'b'],
    });
  }

  static getMissingFieldRequest(): MarkLinksAsFavoriteRequest {
    return new MarkLinksAsFavoriteRequest();
  }
}
