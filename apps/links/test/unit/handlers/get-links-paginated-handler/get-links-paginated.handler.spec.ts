/* eslint-disable @typescript-eslint/unbound-method */
import { GetLinksPaginatedHandler } from '@apps/links/src/application/handlers';
import { GetLinksPaginatedQuery } from '@apps/links/src/application/queries';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
import { type ILinkRepository } from '@apps/links/src/domain/ports';

import { GetLinksPaginatedHandlerFixture } from './get-links-paginated.handler.fixture';

describe('GetLinksPaginatedHandler', () => {
  let handler: GetLinksPaginatedHandler;
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
      createQueryBuilder: jest.fn(),
    };
    i18nService = { translate: jest.fn(), t: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    handler = new GetLinksPaginatedHandler(linkRepository, i18nService as any);
  });

  it('returns failure when no links are found', async () => {
    // Arrange
    linkRepository.findAndCount.mockResolvedValueOnce([GetLinksPaginatedHandlerFixture.emptyList, 0]);
    const request = GetLinksPaginatedHandlerFixture.createRequest();
    const query = new GetLinksPaginatedQuery(request, GetLinksPaginatedHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.notFound);
  });

  it('returns paginated links successfully', async () => {
    // Arrange
    linkRepository.findAndCount.mockResolvedValueOnce([
      GetLinksPaginatedHandlerFixture.linkList,
      GetLinksPaginatedHandlerFixture.totalCount,
    ]);
    const request = GetLinksPaginatedHandlerFixture.createRequest();
    const query = new GetLinksPaginatedQuery(request, GetLinksPaginatedHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(linkRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: GetLinksPaginatedHandlerFixture.validUserId },
        relations: ['groupLink'],
      }),
    );
    expect(result.success).toBe(true);
    expect(result.data?.items).toHaveLength(3);
    expect(result.data?.total).toBe(GetLinksPaginatedHandlerFixture.totalCount);
  });

  it('returns correct pagination metadata', async () => {
    // Arrange
    linkRepository.findAndCount.mockResolvedValueOnce([
      GetLinksPaginatedHandlerFixture.linkList,
      GetLinksPaginatedHandlerFixture.totalCount,
    ]);
    const request = GetLinksPaginatedHandlerFixture.createRequest({ currentPage: 1, take: 10 });
    const query = new GetLinksPaginatedQuery(request, GetLinksPaginatedHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.currentPage).toBe(1);
    expect(result.data?.take).toBe(10);
    expect(result.data?.total).toBe(3);
  });

  it('maps link entities to response DTOs correctly', async () => {
    // Arrange
    linkRepository.findAndCount.mockResolvedValueOnce([
      GetLinksPaginatedHandlerFixture.linkList,
      GetLinksPaginatedHandlerFixture.totalCount,
    ]);
    const request = GetLinksPaginatedHandlerFixture.createRequest();
    const query = new GetLinksPaginatedQuery(request, GetLinksPaginatedHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.items[0]?.title).toBe('Example');
    expect(result.data?.items[0]?.isFavorite).toBe(true);
    expect(result.data?.items[1]?.title).toBe('GitHub');
    expect(result.data?.items[1]?.groupLink?.id).toBe(1);
    expect(result.data?.items[2]?.tagList).toEqual(['dev', 'help']);
  });

  it('passes correct skip and take values to repository', async () => {
    // Arrange
    linkRepository.findAndCount.mockResolvedValueOnce([
      GetLinksPaginatedHandlerFixture.linkList.slice(0, 2),
      GetLinksPaginatedHandlerFixture.totalCount,
    ]);
    const request = GetLinksPaginatedHandlerFixture.createRequest({ currentPage: 2, take: 2, skip: 2 });
    const query = new GetLinksPaginatedQuery(request, GetLinksPaginatedHandlerFixture.validUserId);

    // Act
    await handler.execute(query);

    // Assert
    expect(linkRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 2,
        take: 2,
      }),
    );
  });
});
