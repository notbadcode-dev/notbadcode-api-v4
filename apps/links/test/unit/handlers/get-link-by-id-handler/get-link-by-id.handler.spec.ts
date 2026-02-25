 
import { GetLinkByIdHandler } from '@apps/links/src/application/handlers';
import { GetLinkByIdQuery } from '@apps/links/src/application/queries';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
import { type ILinkRepository } from '@apps/links/src/domain/ports';

import { LinkByIdHandlerFixture } from './get-link-by-id.handler.fixture';

describe('GetLinkByIdHandler', () => {
  let handler: GetLinkByIdHandler;
  let linkRepository: jest.Mocked<ILinkRepository>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };

  beforeEach(() => {
    linkRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    i18nService = { translate: jest.fn(), t: jest.fn() };
     
    handler = new GetLinkByIdHandler(linkRepository, i18nService as any);
  });

  it('returns failure when id is invalid', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);
    const query = new GetLinkByIdQuery(-1, LinkByIdHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(linkRepository.findOne).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidLinkId);
  });

  it('returns failure when id is zero (falsy)', async () => {
    // Arrange
    const query = new GetLinkByIdQuery(0, LinkByIdHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(linkRepository.findOne).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidLinkId);
  });

  it('returns failure when command id is undefined', async () => {
    // Arrange
    const query = { id: undefined } as unknown as GetLinkByIdQuery;

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(linkRepository.findOne).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidLinkId);
  });

  it('returns failure when link is not found', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);
    const query = new GetLinkByIdQuery(LinkByIdHandlerFixture.notFoundId, LinkByIdHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(linkRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: LinkByIdHandlerFixture.notFoundId, userId: LinkByIdHandlerFixture.validUserId },
      }),
    );
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.messageList?.[0]?.message).toEqual(LinksErrorMessageConstants.notFound);
  });

  it('returns success when link is found', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(LinkByIdHandlerFixture.validLink);
    const query = new GetLinkByIdQuery(LinkByIdHandlerFixture.validLink.id, LinkByIdHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(linkRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: LinkByIdHandlerFixture.validLink.id, userId: LinkByIdHandlerFixture.validUserId },
      }),
    );
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(GetLinkByIdResponse);
    expect(result.data?.id).toBe(LinkByIdHandlerFixture.validLink.id);
  });

  it('returns success with group data when link has a group', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(LinkByIdHandlerFixture.validLinkWithGroup);
    const query = new GetLinkByIdQuery(LinkByIdHandlerFixture.validLinkWithGroup.id, LinkByIdHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(GetLinkByIdResponse);
    expect(result.data?.groupLinkId).toBe(LinkByIdHandlerFixture.validLinkWithGroup.groupLinkId);
    expect(result.data?.groupLink).toBeDefined();
    expect(result.data?.groupLink?.id).toBe(LinkByIdHandlerFixture.validLinkWithGroup.groupLink?.id);
    expect(result.data?.groupLink?.title).toBe(LinkByIdHandlerFixture.validLinkWithGroup.groupLink?.title);
    expect(result.data?.groupLink?.color).toEqual(LinkByIdHandlerFixture.validLinkWithGroup.groupLink?.color);
    expect(result.data?.groupLink?.icon).toBe(LinkByIdHandlerFixture.validLinkWithGroup.groupLink?.icon);
  });

  it('returns success with null group when link has no group', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(LinkByIdHandlerFixture.validLink);
    const query = new GetLinkByIdQuery(LinkByIdHandlerFixture.validLink.id, LinkByIdHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.groupLinkId).toBeNull();
    expect(result.data?.groupLink).toBeNull();
  });

  it('includes relations in the specification options', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(LinkByIdHandlerFixture.validLink);
    const query = new GetLinkByIdQuery(LinkByIdHandlerFixture.validLink.id, LinkByIdHandlerFixture.validUserId);

    // Act
    await handler.execute(query);

    // Assert
    expect(linkRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        relations: ['groupLink'],
      }),
    );
  });
});
