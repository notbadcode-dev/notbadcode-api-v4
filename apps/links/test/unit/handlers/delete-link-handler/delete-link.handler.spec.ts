 
import { DeleteLinkCommand } from '@apps/links/src/application/commands';
import { DeleteLinkHandler } from '@apps/links/src/application/handlers';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
import { type ILinkRepository } from '@apps/links/src/domain/ports';

import { DeleteLinkHandlerFixture } from './delete-link.handler.fixture';

describe('DeleteLinkHandler', () => {
  let handler: DeleteLinkHandler;
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
    };
    i18nService = { translate: jest.fn(), t: jest.fn() };
     
    handler = new DeleteLinkHandler(linkRepository, i18nService as any);
  });

  it('returns failure when id is invalid', async () => {
    // Arrange
    const command = new DeleteLinkCommand(-1, DeleteLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(linkRepository.findOne).not.toHaveBeenCalled();
    expect(linkRepository.softDelete).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidLinkId);
  });

  it('returns failure when id is zero (falsy)', async () => {
    // Arrange
    const command = new DeleteLinkCommand(0, DeleteLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(linkRepository.findOne).not.toHaveBeenCalled();
    expect(linkRepository.softDelete).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidLinkId);
  });

  it('returns failure when command id is undefined', async () => {
    // Arrange
    const command = { id: undefined } as unknown as DeleteLinkCommand;

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(linkRepository.findOne).not.toHaveBeenCalled();
    expect(linkRepository.softDelete).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidLinkId);
  });

  it('returns failure when link is not found', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);
    const command = new DeleteLinkCommand(DeleteLinkHandlerFixture.notFoundId, DeleteLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(linkRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: DeleteLinkHandlerFixture.notFoundId, userId: DeleteLinkHandlerFixture.validUserId },
      }),
    );
    expect(linkRepository.softDelete).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.messageList?.[0]?.message).toEqual(LinksErrorMessageConstants.notFound);
  });

  it('returns success and calls softDelete when link exists', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(DeleteLinkHandlerFixture.validLink);
    linkRepository.softDelete.mockResolvedValueOnce({ affected: 1 });
    const command = new DeleteLinkCommand(DeleteLinkHandlerFixture.validLink.id, DeleteLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(linkRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: DeleteLinkHandlerFixture.validLink.id, userId: DeleteLinkHandlerFixture.validUserId },
      }),
    );
    expect(linkRepository.softDelete).toHaveBeenCalledWith({
      id: DeleteLinkHandlerFixture.validLink.id,
      userId: DeleteLinkHandlerFixture.validUserId,
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(GetLinkByIdResponse);
    expect(result.data?.id).toBe(DeleteLinkHandlerFixture.validLink.id);
  });

  it('returns failure when softDelete affects 0 rows', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(DeleteLinkHandlerFixture.validLink);
    linkRepository.softDelete.mockResolvedValueOnce({ affected: 0 });
    const command = new DeleteLinkCommand(DeleteLinkHandlerFixture.validLink.id, DeleteLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.notFound);
  });
});
