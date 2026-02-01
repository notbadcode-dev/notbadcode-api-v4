/* eslint-disable @typescript-eslint/unbound-method */
import { GetLinkByIdHandler } from '@apps/links/src/application/handlers/get-link-by-id.handler';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';
import { GetLinkByIdQuery } from '@apps/links/src/application/queries/get-link-by-id.query';
import { LinksErrorMessageConstants } from '@apps/links/src/constants/links-error-message.constants';
import { type ILinkRepository } from '@apps/links/src/domain/ports/link-repository.port';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
});
