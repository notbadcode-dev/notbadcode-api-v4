/* eslint-disable @typescript-eslint/no-magic-numbers */
export class MarkLinksAsFavoriteFixture {
  static LINK_IDS = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    NINETY_NINE: 99,
    ONE_HUNDRED: 100,
  };

  static validRequest = {
    linkIdList: [MarkLinksAsFavoriteFixture.LINK_IDS.ONE, MarkLinksAsFavoriteFixture.LINK_IDS.TWO, MarkLinksAsFavoriteFixture.LINK_IDS.THREE],
  };

  static links = [
    { id: MarkLinksAsFavoriteFixture.LINK_IDS.ONE, url: 'https://example.com/1', isFavorite: false },
    { id: MarkLinksAsFavoriteFixture.LINK_IDS.TWO, url: 'https://example.com/2', isFavorite: false },
    { id: MarkLinksAsFavoriteFixture.LINK_IDS.THREE, url: 'https://example.com/3', isFavorite: false },
  ];

  static expectedSuccess = [MarkLinksAsFavoriteFixture.LINK_IDS.ONE, MarkLinksAsFavoriteFixture.LINK_IDS.TWO, MarkLinksAsFavoriteFixture.LINK_IDS.THREE];
  static expectedFailure = [];

  static partialRequest = {
    linkIdList: [MarkLinksAsFavoriteFixture.LINK_IDS.ONE, MarkLinksAsFavoriteFixture.LINK_IDS.FOUR],
  };

  static partialLinks = [{ id: MarkLinksAsFavoriteFixture.LINK_IDS.ONE, url: 'https://example.com/1', isFavorite: false }];
  static expectedPartialSuccess = [MarkLinksAsFavoriteFixture.LINK_IDS.ONE];
  static expectedPartialFailure = [MarkLinksAsFavoriteFixture.LINK_IDS.FOUR];

  static notFoundRequest = {
    linkIdList: [MarkLinksAsFavoriteFixture.LINK_IDS.NINETY_NINE, MarkLinksAsFavoriteFixture.LINK_IDS.ONE_HUNDRED],
  };
  static expectedNotFoundFailure = [MarkLinksAsFavoriteFixture.LINK_IDS.NINETY_NINE, MarkLinksAsFavoriteFixture.LINK_IDS.ONE_HUNDRED];

  static partialUpdateRequest = {
    linkIdList: [MarkLinksAsFavoriteFixture.LINK_IDS.ONE, MarkLinksAsFavoriteFixture.LINK_IDS.TWO],
  };

  static partialUpdateLinks = [
    { id: MarkLinksAsFavoriteFixture.LINK_IDS.ONE, url: 'https://example.com/1', isFavorite: false },
    { id: MarkLinksAsFavoriteFixture.LINK_IDS.TWO, url: 'https://example.com/2', isFavorite: false },
  ];

  static expectedPartialUpdateSuccess = [];
  static expectedPartialUpdateFailure = [MarkLinksAsFavoriteFixture.LINK_IDS.ONE, MarkLinksAsFavoriteFixture.LINK_IDS.TWO];
}
