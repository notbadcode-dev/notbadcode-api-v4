 
import { GetGroupLinksPaginatedHandler } from '@apps/links/src/application/handlers';
import { GetGroupLinksPaginatedQuery } from '@apps/links/src/application/queries';
import { GroupLinksErrorMessageConstants } from '@apps/links/src/constants';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports';

import { GetGroupLinksPaginatedHandlerFixture } from './get-group-links-paginated.handler.fixture';

describe('GetGroupLinksPaginatedHandler', () => {
  let handler: GetGroupLinksPaginatedHandler;
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
     
    handler = new GetGroupLinksPaginatedHandler(groupLinkRepository, i18nService as any);
  });

  it('returns failure when no group links are found', async () => {
    // Arrange
    groupLinkRepository.findAndCount.mockResolvedValueOnce([GetGroupLinksPaginatedHandlerFixture.emptyList, 0]);
    const request = GetGroupLinksPaginatedHandlerFixture.createRequest();
    const query = new GetGroupLinksPaginatedQuery(request, GetGroupLinksPaginatedHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.notFound);
  });

  it('returns paginated group links successfully', async () => {
    // Arrange
    groupLinkRepository.findAndCount.mockResolvedValueOnce([
      GetGroupLinksPaginatedHandlerFixture.groupLinkList,
      GetGroupLinksPaginatedHandlerFixture.totalCount,
    ]);
    const request = GetGroupLinksPaginatedHandlerFixture.createRequest();
    const query = new GetGroupLinksPaginatedQuery(request, GetGroupLinksPaginatedHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(groupLinkRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: GetGroupLinksPaginatedHandlerFixture.validUserId },
        relations: ['links'],
      }),
    );
    expect(result.success).toBe(true);
    expect(result.data?.items).toHaveLength(3);
    expect(result.data?.total).toBe(GetGroupLinksPaginatedHandlerFixture.totalCount);
  });

  it('returns correct pagination metadata', async () => {
    // Arrange
    groupLinkRepository.findAndCount.mockResolvedValueOnce([
      GetGroupLinksPaginatedHandlerFixture.groupLinkList,
      GetGroupLinksPaginatedHandlerFixture.totalCount,
    ]);
    const request = GetGroupLinksPaginatedHandlerFixture.createRequest({ currentPage: 1, take: 10 });
    const query = new GetGroupLinksPaginatedQuery(request, GetGroupLinksPaginatedHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.currentPage).toBe(1);
    expect(result.data?.take).toBe(10);
    expect(result.data?.total).toBe(3);
  });

  it('maps group link entities to response DTOs correctly', async () => {
    // Arrange
    groupLinkRepository.findAndCount.mockResolvedValueOnce([
      GetGroupLinksPaginatedHandlerFixture.groupLinkList,
      GetGroupLinksPaginatedHandlerFixture.totalCount,
    ]);
    const request = GetGroupLinksPaginatedHandlerFixture.createRequest();
    const query = new GetGroupLinksPaginatedQuery(request, GetGroupLinksPaginatedHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.items[0]?.title).toBe('First Group');
    expect(result.data?.items[0]?.isFavorite).toBe(true);
    expect(result.data?.items[1]?.title).toBe('Second Group');
    expect(result.data?.items[2]?.parentGroupLinkId).toBe(1);
  });

  it('passes correct skip and take values to repository', async () => {
    // Arrange
    groupLinkRepository.findAndCount.mockResolvedValueOnce([
      GetGroupLinksPaginatedHandlerFixture.groupLinkList.slice(0, 2),
      GetGroupLinksPaginatedHandlerFixture.totalCount,
    ]);
    const request = GetGroupLinksPaginatedHandlerFixture.createRequest({ currentPage: 2, take: 2, skip: 2 });
    const query = new GetGroupLinksPaginatedQuery(request, GetGroupLinksPaginatedHandlerFixture.validUserId);

    // Act
    await handler.execute(query);

    // Assert
    expect(groupLinkRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 2,
        take: 2,
      }),
    );
  });
});
