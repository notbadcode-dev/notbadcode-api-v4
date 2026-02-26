import { GetFavoriteGroupsHandler } from '@apps/links/src/application/handlers';
import { GetFavoriteGroupsQuery } from '@apps/links/src/application/queries';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports/group-link-repository.port';

import { GetFavoriteGroupsHandlerFixture } from './get-favorite-groups.handler.fixture';

describe('GetFavoriteGroupsHandler', () => {
  let handler: GetFavoriteGroupsHandler;
  let groupLinkRepository: jest.Mocked<IGroupLinkRepository>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };

  beforeEach(() => {
    groupLinkRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as any;
    i18nService = { translate: jest.fn().mockResolvedValue('translated'), t: jest.fn() };

    handler = new GetFavoriteGroupsHandler(groupLinkRepository, i18nService as any);
  });

  it('returns empty list when no favorite groups exist', async () => {
    // Arrange
    groupLinkRepository.findAndCount.mockResolvedValueOnce([GetFavoriteGroupsHandlerFixture.emptyList, 0]);
    const query = new GetFavoriteGroupsQuery(GetFavoriteGroupsHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.groupLinkList).toHaveLength(0);
    }
    expect(groupLinkRepository.findAndCount).toHaveBeenCalledWith({
      where: {
        userId: GetFavoriteGroupsHandlerFixture.validUserId,
        isFavorite: true,
      },
      relations: ['links'],
      skip: 0,
      take: 100,
    });
  });

  it('returns favorite groups successfully', async () => {
    // Arrange
    groupLinkRepository.findAndCount.mockResolvedValueOnce([
      GetFavoriteGroupsHandlerFixture.favoriteGroups,
      GetFavoriteGroupsHandlerFixture.favoriteGroups.length,
    ]);
    const query = new GetFavoriteGroupsQuery(GetFavoriteGroupsHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.groupLinkList).toHaveLength(2);
      expect(result.data.groupLinkList[0].title).toBe('Work Favorites');
      expect(result.data.groupLinkList[0].links).toHaveLength(2);
    }
  });
});
