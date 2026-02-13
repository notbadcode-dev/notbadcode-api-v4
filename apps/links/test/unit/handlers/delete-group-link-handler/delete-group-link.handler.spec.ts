/* eslint-disable @typescript-eslint/unbound-method */
import { DeleteGroupLinkCommand } from '@apps/links/src/application/commands';
import { DeleteGroupLinkHandler } from '@apps/links/src/application/handlers';
import { GroupLinksErrorMessageConstants } from '@apps/links/src/constants';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports';

import { DeleteGroupLinkHandlerFixture } from './delete-group-link.handler.fixture';

describe('DeleteGroupLinkHandler', () => {
  let handler: DeleteGroupLinkHandler;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    handler = new DeleteGroupLinkHandler(groupLinkRepository, i18nService as any);
  });

  it('returns failure when id is zero', async () => {
    // Arrange
    const command = new DeleteGroupLinkCommand(0, DeleteGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidGroupLinkId);
  });

  it('returns failure when id is negative', async () => {
    // Arrange
    const command = new DeleteGroupLinkCommand(-1, DeleteGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidGroupLinkId);
  });

  it('returns failure when group link is not found', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(null);
    const command = new DeleteGroupLinkCommand(DeleteGroupLinkHandlerFixture.nonExistentGroupLinkId, DeleteGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(groupLinkRepository.findOne).toHaveBeenCalledWith({
      where: { id: DeleteGroupLinkHandlerFixture.nonExistentGroupLinkId, userId: DeleteGroupLinkHandlerFixture.validUserId },
    });
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.notFound);
  });

  it('deletes group link successfully', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(DeleteGroupLinkHandlerFixture.existingGroupLink);
    groupLinkRepository.softDelete.mockResolvedValueOnce({ affected: 1 });
    const command = new DeleteGroupLinkCommand(DeleteGroupLinkHandlerFixture.validGroupLinkId, DeleteGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(groupLinkRepository.findOne).toHaveBeenCalled();
    expect(groupLinkRepository.softDelete).toHaveBeenCalledWith({
      id: DeleteGroupLinkHandlerFixture.validGroupLinkId,
      userId: DeleteGroupLinkHandlerFixture.validUserId,
    });
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe(DeleteGroupLinkHandlerFixture.validGroupLinkId);
    expect(result.data?.title).toBe('Group to Delete');
  });

  it('returns the deleted group link data in the response', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(DeleteGroupLinkHandlerFixture.existingGroupLink);
    groupLinkRepository.softDelete.mockResolvedValueOnce({ affected: 1 });
    const command = new DeleteGroupLinkCommand(DeleteGroupLinkHandlerFixture.validGroupLinkId, DeleteGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.title).toBe(DeleteGroupLinkHandlerFixture.existingGroupLink.title);
    expect(result.data?.description).toBe(DeleteGroupLinkHandlerFixture.existingGroupLink.description);
  });
});
