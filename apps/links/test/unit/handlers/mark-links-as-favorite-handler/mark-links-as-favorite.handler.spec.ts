import { type I18nService } from '@common/i18n';

import { MarkLinksAsFavoriteCommand } from '@apps/links/src/application/commands/mark-links-as-favorite.command';
import { MarkLinksAsFavoriteHandler } from '@apps/links/src/application/handlers/mark-links-as-favorite.handler';
import { type ILinkRepository } from '@apps/links/src/domain/ports/link-repository.port';

import { MarkLinksAsFavoriteFixture } from './mark-links-as-favorite.handler.fixture';

describe('MarkLinksAsFavoriteHandler', () => {
  let handler: MarkLinksAsFavoriteHandler;
  let mockRepo: Partial<jest.Mocked<ILinkRepository>>;
  let mockI18n: Partial<I18nService>;

  beforeEach(() => {
    mockRepo = {};
    mockI18n = { translate: jest.fn().mockResolvedValue('') };
    handler = new MarkLinksAsFavoriteHandler(mockRepo as ILinkRepository, mockI18n as I18nService);
  });

  it('should mark all links as favorite and return success', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue(MarkLinksAsFavoriteFixture.links);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: MarkLinksAsFavoriteFixture.links.length });
    const command = new MarkLinksAsFavoriteCommand(MarkLinksAsFavoriteFixture.validRequest, MarkLinksAsFavoriteFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data?.successList).toEqual(MarkLinksAsFavoriteFixture.expectedSuccess);
    expect(result.data?.failureList).toEqual(MarkLinksAsFavoriteFixture.expectedFailure);
  });

  it('should return partial success and failure for missing links', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue(MarkLinksAsFavoriteFixture.partialLinks);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: MarkLinksAsFavoriteFixture.partialLinks.length });
    const command = new MarkLinksAsFavoriteCommand(MarkLinksAsFavoriteFixture.partialRequest, MarkLinksAsFavoriteFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data?.successList).toEqual(MarkLinksAsFavoriteFixture.expectedPartialSuccess);
    expect(result.data?.failureList).toEqual(MarkLinksAsFavoriteFixture.expectedPartialFailure);
  });

  it('should return all failures if no links found', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue([]);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: 0 });
    const command = new MarkLinksAsFavoriteCommand(MarkLinksAsFavoriteFixture.notFoundRequest, MarkLinksAsFavoriteFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data?.successList).toEqual([]);
    expect(result.data?.failureList).toEqual(MarkLinksAsFavoriteFixture.expectedNotFoundFailure);
  });

  it('should return empty arrays if linkIdList is empty', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue([]);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: 0 });
    const command = new MarkLinksAsFavoriteCommand({ linkIdList: [] }, MarkLinksAsFavoriteFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data?.successList).toEqual([]);
    expect(result.data?.failureList).toEqual([]);
  });

  it('should handle partial update (affected < existingIds.length)', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue(MarkLinksAsFavoriteFixture.partialUpdateLinks);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: 1 });
    const command = new MarkLinksAsFavoriteCommand(MarkLinksAsFavoriteFixture.partialUpdateRequest, MarkLinksAsFavoriteFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data?.successList).toEqual([MarkLinksAsFavoriteFixture.LINK_IDS.ONE]);
    expect(result.data?.failureList).toEqual([MarkLinksAsFavoriteFixture.LINK_IDS.TWO]);
  });

  it('should handle update affecting 0 but links exist', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue(MarkLinksAsFavoriteFixture.partialUpdateLinks);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: 0 });
    const command = new MarkLinksAsFavoriteCommand(MarkLinksAsFavoriteFixture.partialUpdateRequest, MarkLinksAsFavoriteFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data?.successList).toEqual([]);
    expect(result.data?.failureList).toEqual(MarkLinksAsFavoriteFixture.expectedPartialUpdateFailure);
  });

  it('should not duplicate ids in result if request has duplicates', async () => {
    // Arrange
    const { LINK_IDS } = MarkLinksAsFavoriteFixture;
    const links = [MarkLinksAsFavoriteFixture.links[0]];
    mockRepo.find = jest.fn().mockResolvedValue(links);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: 1 });
    const command = new MarkLinksAsFavoriteCommand({ linkIdList: [LINK_IDS.ONE, LINK_IDS.ONE, LINK_IDS.ONE] }, MarkLinksAsFavoriteFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data?.successList).toEqual([LINK_IDS.ONE]);
    expect(result.data?.failureList).toEqual([]);
  });
});
