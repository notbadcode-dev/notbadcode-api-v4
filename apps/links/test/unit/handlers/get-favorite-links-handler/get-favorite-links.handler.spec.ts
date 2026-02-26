import { IsNull } from 'typeorm';

import { GetFavoriteLinksHandler } from '@apps/links/src/application/handlers';
import { GetFavoriteLinksQuery } from '@apps/links/src/application/queries';
import { type ILinkRepository } from '@apps/links/src/domain/ports';

import { GetFavoriteLinksHandlerFixture } from './get-favorite-links.handler.fixture';

describe('GetFavoriteLinksHandler', () => {
  let handler: GetFavoriteLinksHandler;
  let linkRepository: jest.Mocked<ILinkRepository>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };

  beforeEach(() => {
    linkRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as any;
    i18nService = { translate: jest.fn().mockResolvedValue('translated'), t: jest.fn() };

    handler = new GetFavoriteLinksHandler(linkRepository, i18nService as any);
  });

  it('returns an empty list when no favorite links exist', async () => {
    // Arrange
    linkRepository.find.mockResolvedValueOnce(GetFavoriteLinksHandlerFixture.emptyList);
    const query = new GetFavoriteLinksQuery(GetFavoriteLinksHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.linkList).toHaveLength(0);
    }
    expect(linkRepository.find).toHaveBeenCalledWith({
      where: {
        userId: GetFavoriteLinksHandlerFixture.validUserId,
        isFavorite: true,
        groupLinkId: IsNull(),
      },
    });
  });

  it('returns favorite links successfully', async () => {
    // Arrange
    linkRepository.find.mockResolvedValueOnce(GetFavoriteLinksHandlerFixture.favoriteLinks);
    const query = new GetFavoriteLinksQuery(GetFavoriteLinksHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.linkList).toHaveLength(2);
      expect(result.data.linkList[0].url).toBe('https://favorite1.com');
    }
  });
});
