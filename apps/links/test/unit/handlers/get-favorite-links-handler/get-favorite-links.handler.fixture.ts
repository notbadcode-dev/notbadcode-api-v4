import { type Link } from '@apps/links/src/domain/entities';

export class GetFavoriteLinksHandlerFixture {
  static readonly validUserId = 1;
  static readonly emptyList: Link[] = [];

  static readonly favoriteLinks: Link[] = [
    {
      id: 1,
      userId: GetFavoriteLinksHandlerFixture.validUserId,
      url: 'https://favorite1.com',
      title: 'Favorite 1',
      isFavorite: true,
      groupLinkId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Link,
    {
      id: 2,
      userId: GetFavoriteLinksHandlerFixture.validUserId,
      url: 'https://favorite2.com',
      title: 'Favorite 2',
      isFavorite: true,
      groupLinkId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Link,
  ];
}
