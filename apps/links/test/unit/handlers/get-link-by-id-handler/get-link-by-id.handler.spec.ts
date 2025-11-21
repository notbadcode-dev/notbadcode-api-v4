/* eslint-disable @typescript-eslint/unbound-method */
import { mockDeep } from 'jest-mock-extended';
import { type Repository } from 'typeorm';

import { GetLinkByIdCommand } from '@apps/links/src/application/commands/get-link-by-id.command';
import { GetLinkByIdHandler } from '@apps/links/src/application/handlers/get-link-by-id.handler';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';
import { LinksErrorMessageConstants } from '@apps/links/src/constants/links-error-message.constants';
import { type Link } from '@apps/links/src/domain/entities/link.entity';

import { LinkByIdHandlerFixture } from './get-link-by-id.handler.fixture';

describe('GetLinkByIdHandler', () => {
  let handler: GetLinkByIdHandler;
  let linkRepository: jest.Mocked<Repository<Link>>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };

  beforeEach(() => {
    linkRepository = mockDeep<Repository<Link>>();
    i18nService = { translate: jest.fn(), t: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    handler = new GetLinkByIdHandler(linkRepository, i18nService as any);
  });

  it('returns failure when id is invalid', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);
    const command = new GetLinkByIdCommand(-1);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(linkRepository.findOne).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidLinkId);
  });

  it('returns failure when link is not found', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);
    const command = new GetLinkByIdCommand(LinkByIdHandlerFixture.notFoundId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(linkRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: LinkByIdHandlerFixture.notFoundId },
      }),
    );
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.messageList?.[0]?.message).toEqual(LinksErrorMessageConstants.notFound);
  });

  it('returns success when link is found', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(LinkByIdHandlerFixture.validLink);
    const command = new GetLinkByIdCommand(LinkByIdHandlerFixture.validLink.id);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(linkRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: LinkByIdHandlerFixture.validLink.id },
      }),
    );
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(GetLinkByIdResponse);
    expect(result.data?.id).toBe(LinkByIdHandlerFixture.validLink.id);
  });
});
