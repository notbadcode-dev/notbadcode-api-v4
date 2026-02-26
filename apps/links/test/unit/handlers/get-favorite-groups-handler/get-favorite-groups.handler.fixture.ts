import { type GroupLink } from '@apps/links/src/domain/entities';

export class GetFavoriteGroupsHandlerFixture {
  static readonly validUserId = 1;
  static readonly emptyList: GroupLink[] = [];

  static readonly favoriteGroups: GroupLink[] = [
    {
      id: 1,
      userId: GetFavoriteGroupsHandlerFixture.validUserId,
      title: 'Work Favorites',
      isFavorite: true,
      links: [
        { id: 10, title: 'Task 1', url: 'https://task1.com' },
        { id: 11, title: 'Task 2', url: 'https://task2.com' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    {
      id: 2,
      userId: GetFavoriteGroupsHandlerFixture.validUserId,
      title: 'Personal Favorites',
      isFavorite: true,
      links: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
  ];
}
