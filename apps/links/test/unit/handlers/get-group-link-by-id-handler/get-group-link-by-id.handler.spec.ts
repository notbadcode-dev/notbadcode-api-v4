/* eslint-disable @typescript-eslint/unbound-method */
import { GetGroupLinkByIdHandler } from '@apps/links/src/application/handlers';
import { GetGroupLinkByIdResponse } from '@apps/links/src/application/responses';
import { GetGroupLinkByIdQuery } from '@apps/links/src/application/queries';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports';

import { GroupLinkByIdHandlerFixture } from './get-group-link-by-id.handler.fixture';

describe('GetGroupLinkByIdHandler', () => {
  let handler: GetGroupLinkByIdHandler;
  let groupLinkRepository: jest.Mocked<IGroupLinkRepository>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };

  beforeEach(() => {
    groupLinkRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    i18nService = { translate: jest.fn(), t: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    handler = new GetGroupLinkByIdHandler(groupLinkRepository, i18nService as any);
  });

  it('returns failure when id is invalid', async () => {
    // Arrange
    const query = new GetGroupLinkByIdQuery(-1, GroupLinkByIdHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(groupLinkRepository.findOne).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidGroupLinkId);
  });

  it('returns failure when id is zero (falsy)', async () => {
    // Arrange
    const query = new GetGroupLinkByIdQuery(0, GroupLinkByIdHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(groupLinkRepository.findOne).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidGroupLinkId);
  });

  it('returns failure when command id is undefined', async () => {
    // Arrange
    const query = { id: undefined } as unknown as GetGroupLinkByIdQuery;

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(groupLinkRepository.findOne).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidGroupLinkId);
  });

  it('returns failure when group link is not found', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(null);
    const query = new GetGroupLinkByIdQuery(GroupLinkByIdHandlerFixture.notFoundId, GroupLinkByIdHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(groupLinkRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: GroupLinkByIdHandlerFixture.notFoundId, userId: GroupLinkByIdHandlerFixture.validUserId },
      }),
    );
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.messageList?.[0]?.message).toEqual(LinksErrorMessageConstants.groupLinkNotFound);
  });

  it('returns success when group link is found without links', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(GroupLinkByIdHandlerFixture.validGroupLink);
    const query = new GetGroupLinkByIdQuery(GroupLinkByIdHandlerFixture.validGroupLink.id, GroupLinkByIdHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(groupLinkRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: GroupLinkByIdHandlerFixture.validGroupLink.id, userId: GroupLinkByIdHandlerFixture.validUserId },
      }),
    );
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(GetGroupLinkByIdResponse);
    expect(result.data?.id).toBe(GroupLinkByIdHandlerFixture.validGroupLink.id);
    expect(result.data?.title).toBe(GroupLinkByIdHandlerFixture.validGroupLink.title);
    expect(result.data?.links).toEqual([]);
  });

  it('returns success with nested links when group link has links', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(GroupLinkByIdHandlerFixture.validGroupLinkWithLinks);
    const query = new GetGroupLinkByIdQuery(GroupLinkByIdHandlerFixture.validGroupLinkWithLinks.id, GroupLinkByIdHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(GetGroupLinkByIdResponse);
    expect(result.data?.id).toBe(GroupLinkByIdHandlerFixture.validGroupLinkWithLinks.id);
    expect(result.data?.isFavorite).toBe(GroupLinkByIdHandlerFixture.validGroupLinkWithLinks.isFavorite);
    expect(result.data?.links).toHaveLength(2);
    expect(result.data?.links?.[0]?.url).toBe('https://figma.com');
    expect(result.data?.links?.[1]?.url).toBe('https://dribbble.com');
  });

  it('includes relations in the specification options', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(GroupLinkByIdHandlerFixture.validGroupLink);
    const query = new GetGroupLinkByIdQuery(GroupLinkByIdHandlerFixture.validGroupLink.id, GroupLinkByIdHandlerFixture.validUserId);

    // Act
    await handler.execute(query);

    // Assert
    expect(groupLinkRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        relations: ['links'],
      }),
    );
  });
});
