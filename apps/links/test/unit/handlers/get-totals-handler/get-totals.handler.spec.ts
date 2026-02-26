import { GetTotalsHandler } from '@apps/links/src/application/handlers';
import { GetTotalsQuery } from '@apps/links/src/application/queries';
import { type IGroupLinkRepository, type ILinkRepository } from '@apps/links/src/domain/ports';

import { GetTotalsHandlerFixture } from './get-totals.handler.fixture';

describe('GetTotalsHandler', () => {
  let handler: GetTotalsHandler;
  let linkRepository: jest.Mocked<ILinkRepository>;
  let groupLinkRepository: jest.Mocked<IGroupLinkRepository>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };

  beforeEach(() => {
    linkRepository = {
      findAndCount: jest.fn(),
    } as any;
    groupLinkRepository = {
      findAndCount: jest.fn(),
    } as any;
    i18nService = { translate: jest.fn().mockResolvedValue('translated'), t: jest.fn() };

    handler = new GetTotalsHandler(linkRepository, groupLinkRepository, i18nService as any);
  });

  it('returns correct totals for a user', async () => {
    // Arrange
    linkRepository.findAndCount.mockResolvedValueOnce([[], GetTotalsHandlerFixture.linkCount]);
    groupLinkRepository.findAndCount.mockResolvedValueOnce([[], GetTotalsHandlerFixture.groupCount]);
    const query = new GetTotalsQuery(GetTotalsHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalLinks).toBe(GetTotalsHandlerFixture.linkCount);
      expect(result.data.totalGroups).toBe(GetTotalsHandlerFixture.groupCount);
    }
    expect(linkRepository.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: GetTotalsHandlerFixture.validUserId },
      skip: 0,
      take: 0,
    }));
    expect(groupLinkRepository.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: GetTotalsHandlerFixture.validUserId },
      skip: 0,
      take: 0,
    }));
  });
});
