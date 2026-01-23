import { type I18nService } from '@common/i18n';

import { UnmarkLinksAsFavoriteCommand } from '@apps/links/src/application/commands/unmark-links-as-favorite.command';
import { UnmarkLinksAsFavoriteHandler } from '@apps/links/src/application/handlers/unmark-links-as-favorite.handler';
import type { Link } from '@apps/links/src/domain/entities/link.entity';

import { UnmarkLinksAsFavoriteFixture } from './unmark-links-as-favorite.handler.fixture';

import type { Repository } from 'typeorm';

describe('UnmarkLinksAsFavoriteHandler', () => {
  let handler: UnmarkLinksAsFavoriteHandler;
  let mockRepo: Partial<Repository<Link>>;
  let mockI18n: Partial<I18nService>;

  beforeEach(() => {
    mockRepo = {};
    mockI18n = { translate: jest.fn().mockResolvedValue('') };
    handler = new UnmarkLinksAsFavoriteHandler(mockRepo as Repository<Link>, mockI18n as I18nService);
  });

  it('should unmark all links as favorite and return success', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue(UnmarkLinksAsFavoriteFixture.links);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: UnmarkLinksAsFavoriteFixture.links.length });
    const command = new UnmarkLinksAsFavoriteCommand(UnmarkLinksAsFavoriteFixture.validRequest);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data).toBeDefined();
    expect(result.data?.successList).toEqual(UnmarkLinksAsFavoriteFixture.expectedSuccess);
    expect(result.data?.failureList).toEqual(UnmarkLinksAsFavoriteFixture.expectedFailure);
  });

  it('should return partial success and failure for missing links', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue(UnmarkLinksAsFavoriteFixture.partialLinks);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: UnmarkLinksAsFavoriteFixture.partialLinks.length });
    const command = new UnmarkLinksAsFavoriteCommand(UnmarkLinksAsFavoriteFixture.partialRequest);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data).toBeDefined();
    expect(result.data?.successList).toEqual(UnmarkLinksAsFavoriteFixture.expectedPartialSuccess);
    expect(result.data?.failureList).toEqual(UnmarkLinksAsFavoriteFixture.expectedPartialFailure);
  });

  it('should return all failures if no links found', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue([]);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: 0 });
    const command = new UnmarkLinksAsFavoriteCommand(UnmarkLinksAsFavoriteFixture.notFoundRequest);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data).toBeDefined();
    expect(result.data?.successList).toEqual([]);
    expect(result.data?.failureList).toEqual(UnmarkLinksAsFavoriteFixture.expectedNotFoundFailure);
  });

  it('should return empty arrays if linkIdList is empty', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue([]);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: 0 });
    const command = new UnmarkLinksAsFavoriteCommand({ linkIdList: [] });

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data).toBeDefined();
    expect(result.data?.successList).toEqual([]);
    expect(result.data?.failureList).toEqual([]);
  });

  it('should handle partial update (affected < existingIds.length)', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue(UnmarkLinksAsFavoriteFixture.partialUpdateLinks);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: 1 });
    const command = new UnmarkLinksAsFavoriteCommand(UnmarkLinksAsFavoriteFixture.partialUpdateRequest);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data).toBeDefined();
    expect(result.data?.successList).toEqual(UnmarkLinksAsFavoriteFixture.expectedPartialUpdateSuccess);
    expect(result.data?.failureList).toEqual(UnmarkLinksAsFavoriteFixture.expectedPartialUpdateFailure);
  });

  it('should handle update affecting 0 but links exist', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue(UnmarkLinksAsFavoriteFixture.partialUpdateLinks);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: 0 });
    const command = new UnmarkLinksAsFavoriteCommand(UnmarkLinksAsFavoriteFixture.partialUpdateRequest);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data).toBeDefined();
    expect(result.data?.successList).toEqual([]);
    expect(result.data?.failureList).toEqual([UnmarkLinksAsFavoriteFixture.LINK_IDS.ONE, UnmarkLinksAsFavoriteFixture.LINK_IDS.TWO]);
  });

  it('should not duplicate ids in result if request has duplicates', async () => {
    // Arrange
    mockRepo.find = jest.fn().mockResolvedValue(UnmarkLinksAsFavoriteFixture.duplicateLinks);
    mockRepo.update = jest.fn().mockResolvedValue({ affected: 1 });
    const command = new UnmarkLinksAsFavoriteCommand(UnmarkLinksAsFavoriteFixture.duplicateRequest);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.data).toBeDefined();
    expect(result.data?.successList).toEqual(UnmarkLinksAsFavoriteFixture.expectedDuplicateSuccess);
    expect(result.data?.failureList).toEqual(UnmarkLinksAsFavoriteFixture.expectedDuplicateFailure);
  });
});
