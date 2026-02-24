/* eslint-disable @typescript-eslint/unbound-method */
import { MarkGroupLinksAsFavoriteCommand } from '@apps/links/src/application/commands';
import { MarkGroupLinksAsFavoriteHandler } from '@apps/links/src/application/handlers';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports';

import { MarkGroupLinksAsFavoriteHandlerFixture } from './mark-group-links-as-favorite.handler.fixture';

describe('MarkGroupLinksAsFavoriteHandler', () => {
  let handler: MarkGroupLinksAsFavoriteHandler;
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
    handler = new MarkGroupLinksAsFavoriteHandler(groupLinkRepository, i18nService as any);
  });

  it('returns empty lists when groupLinkIdList is empty', async () => {
    // Arrange
    const request = MarkGroupLinksAsFavoriteHandlerFixture.createRequest({ groupLinkIdList: [] });
    const command = new MarkGroupLinksAsFavoriteCommand(request, MarkGroupLinksAsFavoriteHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.successList).toHaveLength(0);
    expect(result.data?.failureList).toHaveLength(0);
  });

  it('marks all existing group links as favorite successfully', async () => {
    // Arrange
    groupLinkRepository.find.mockResolvedValueOnce(MarkGroupLinksAsFavoriteHandlerFixture.existingGroupLinks);
    groupLinkRepository.update.mockResolvedValueOnce({ affected: 3 });
    const request = MarkGroupLinksAsFavoriteHandlerFixture.createRequest();
    const command = new MarkGroupLinksAsFavoriteCommand(request, MarkGroupLinksAsFavoriteHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(groupLinkRepository.find).toHaveBeenCalled();
    expect(groupLinkRepository.update).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data?.successList).toEqual(MarkGroupLinksAsFavoriteHandlerFixture.existingIds);
    expect(result.data?.failureList).toHaveLength(0);
  });

  it('returns non-existent ids in failureList', async () => {
    // Arrange
    groupLinkRepository.find.mockResolvedValueOnce([]);
    const request = MarkGroupLinksAsFavoriteHandlerFixture.createRequest({
      groupLinkIdList: MarkGroupLinksAsFavoriteHandlerFixture.nonExistentIds,
    });
    const command = new MarkGroupLinksAsFavoriteCommand(request, MarkGroupLinksAsFavoriteHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.successList).toHaveLength(0);
    expect(result.data?.failureList).toEqual(MarkGroupLinksAsFavoriteHandlerFixture.nonExistentIds);
  });

  it('handles mixed existing and non-existing ids', async () => {
    // Arrange
    const mixedIds = [1, 99];
    groupLinkRepository.find.mockResolvedValueOnce([MarkGroupLinksAsFavoriteHandlerFixture.existingGroupLinks[0]]);
    groupLinkRepository.update.mockResolvedValueOnce({ affected: 1 });
    const request = MarkGroupLinksAsFavoriteHandlerFixture.createRequest({ groupLinkIdList: mixedIds });
    const command = new MarkGroupLinksAsFavoriteCommand(request, MarkGroupLinksAsFavoriteHandlerFixture.validUserId);

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
    const request = MarkGroupLinksAsFavoriteHandlerFixture.createRequest({ groupLinkIdList: [1, 2, 3] });
    const command = new MarkGroupLinksAsFavoriteCommand(request, MarkGroupLinksAsFavoriteHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.successList).toEqual([1, 2]);
    expect(result.data?.failureList).toEqual([3]);
  });
});
