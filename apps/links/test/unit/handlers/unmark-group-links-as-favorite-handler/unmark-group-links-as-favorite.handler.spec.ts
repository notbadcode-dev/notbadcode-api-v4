/* eslint-disable @typescript-eslint/unbound-method */
import { UnmarkGroupLinksAsFavoriteCommand } from '@apps/links/src/application/commands';
import { UnmarkGroupLinksAsFavoriteHandler } from '@apps/links/src/application/handlers';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports';

import { UnmarkGroupLinksAsFavoriteHandlerFixture } from './unmark-group-links-as-favorite.handler.fixture';

describe('UnmarkGroupLinksAsFavoriteHandler', () => {
  let handler: UnmarkGroupLinksAsFavoriteHandler;
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
    };
    i18nService = { translate: jest.fn(), t: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    handler = new UnmarkGroupLinksAsFavoriteHandler(groupLinkRepository, i18nService as any);
  });

  it('returns empty lists when groupLinkIdList is empty', async () => {
    // Arrange
    const request = UnmarkGroupLinksAsFavoriteHandlerFixture.createRequest({ groupLinkIdList: [] });
    const command = new UnmarkGroupLinksAsFavoriteCommand(request, UnmarkGroupLinksAsFavoriteHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.successList).toHaveLength(0);
    expect(result.data?.failureList).toHaveLength(0);
  });

  it('unmarks all existing group links as favorite successfully', async () => {
    // Arrange
    groupLinkRepository.find.mockResolvedValueOnce(UnmarkGroupLinksAsFavoriteHandlerFixture.existingGroupLinks);
    groupLinkRepository.update.mockResolvedValueOnce({ affected: 3 });
    const request = UnmarkGroupLinksAsFavoriteHandlerFixture.createRequest();
    const command = new UnmarkGroupLinksAsFavoriteCommand(request, UnmarkGroupLinksAsFavoriteHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(groupLinkRepository.find).toHaveBeenCalled();
    expect(groupLinkRepository.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ isFavorite: false }),
    );
    expect(result.success).toBe(true);
    expect(result.data?.successList).toEqual(UnmarkGroupLinksAsFavoriteHandlerFixture.existingIds);
    expect(result.data?.failureList).toHaveLength(0);
  });

  it('returns non-existent ids in failureList', async () => {
    // Arrange
    groupLinkRepository.find.mockResolvedValueOnce([]);
    const request = UnmarkGroupLinksAsFavoriteHandlerFixture.createRequest({
      groupLinkIdList: UnmarkGroupLinksAsFavoriteHandlerFixture.nonExistentIds,
    });
    const command = new UnmarkGroupLinksAsFavoriteCommand(request, UnmarkGroupLinksAsFavoriteHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.successList).toHaveLength(0);
    expect(result.data?.failureList).toEqual(UnmarkGroupLinksAsFavoriteHandlerFixture.nonExistentIds);
  });

  it('handles mixed existing and non-existing ids', async () => {
    // Arrange
    const mixedIds = [1, 99];
    groupLinkRepository.find.mockResolvedValueOnce([UnmarkGroupLinksAsFavoriteHandlerFixture.existingGroupLinks[0]]);
    groupLinkRepository.update.mockResolvedValueOnce({ affected: 1 });
    const request = UnmarkGroupLinksAsFavoriteHandlerFixture.createRequest({ groupLinkIdList: mixedIds });
    const command = new UnmarkGroupLinksAsFavoriteCommand(request, UnmarkGroupLinksAsFavoriteHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.successList).toEqual([1]);
    expect(result.data?.failureList).toEqual([99]);
  });

  it('handles partial update when affected is less than existingIds length', async () => {
    // Arrange
    const groupLinks = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ];
    groupLinkRepository.find.mockResolvedValueOnce(groupLinks as any);
    groupLinkRepository.update.mockResolvedValueOnce({ affected: 2 });
    const request = UnmarkGroupLinksAsFavoriteHandlerFixture.createRequest({ groupLinkIdList: [1, 2, 3] });
    const command = new UnmarkGroupLinksAsFavoriteCommand(request, UnmarkGroupLinksAsFavoriteHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.successList).toEqual([1, 2]);
    expect(result.data?.failureList).toEqual([3]);
  });
});
