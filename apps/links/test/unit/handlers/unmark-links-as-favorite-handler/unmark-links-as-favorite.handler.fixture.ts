 
export class UnmarkLinksAsFavoriteFixture {
  static LINK_IDS = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    NINETY_NINE: 99,
    ONE_HUNDRED: 100,
  };

  static validRequest = {
    linkIdList: [UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE, UnmarkLinksAsFavoriteFixture.LINK_IDS.TWO, UnmarkLinksAsFavoriteFixture.LINK_IDS.THREE],
  };

  static links = [
    { id: UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE, url: 'https://example.com/1', isFavorite: true },
    { id: UnmarkLinksAsFavoriteFixture.LINK_IDS.TWO, url: 'https://example.com/2', isFavorite: true },
    { id: UnmarkLinksAsFavoriteFixture.LINK_IDS.THREE, url: 'https://example.com/3', isFavorite: true },
  ];

  static expectedSuccess = [UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE, UnmarkLinksAsFavoriteFixture.LINK_IDS.TWO, UnmarkLinksAsFavoriteFixture.LINK_IDS.THREE];
  static expectedFailure = [];

  static partialRequest = {
    linkIdList: [UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE, UnmarkLinksAsFavoriteFixture.LINK_IDS.FOUR],
  };

  static partialLinks = [{ id: UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE, url: 'https://example.com/1', isFavorite: true }];
  static expectedPartialSuccess = [UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE];
  static expectedPartialFailure = [UnmarkLinksAsFavoriteFixture.LINK_IDS.FOUR];

  static notFoundRequest = {
    linkIdList: [UnmarkLinksAsFavoriteFixture.LINK_IDS.NINETY_NINE, UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE_HUNDRED],
  };
  static expectedNotFoundFailure = [UnmarkLinksAsFavoriteFixture.LINK_IDS.NINETY_NINE, UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE_HUNDRED];
  static partialUpdateRequest = {
    linkIdList: [UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE, UnmarkLinksAsFavoriteFixture.LINK_IDS.TWO],
  };

  static partialUpdateLinks = [
    { id: UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE, url: 'https://example.com/1', isFavorite: true },
    { id: UnmarkLinksAsFavoriteFixture.LINK_IDS.TWO, url: 'https://example.com/2', isFavorite: true },
  ];

  static expectedPartialUpdateSuccess = [UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE];
  static expectedPartialUpdateFailure = [UnmarkLinksAsFavoriteFixture.LINK_IDS.TWO];

  static duplicateRequest = {
    linkIdList: [UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE, UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE, UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE],
  };

  static duplicateLinks = [{ id: UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE, url: 'https://example.com/1', isFavorite: true }];

  static expectedDuplicateSuccess = [UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE];
  static expectedDuplicateFailure = [];

  static readonly validUserId = 1;
}
