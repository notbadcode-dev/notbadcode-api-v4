/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateGroupLinkCommand } from '@apps/links/src/application/commands';
import { UpdateGroupLinkHandler } from '@apps/links/src/application/handlers';
import { GroupLinksErrorMessageConstants } from '@apps/links/src/constants';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports';

import { UpdateGroupLinkHandlerFixture } from './update-group-link.handler.fixture';

describe('UpdateGroupLinkHandler', () => {
  let handler: UpdateGroupLinkHandler;
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
    handler = new UpdateGroupLinkHandler(groupLinkRepository, i18nService as any);
  });

  it('returns failure when id is invalid', async () => {
    // Arrange
    const payload = UpdateGroupLinkHandlerFixture.createPayload();
    const command = new UpdateGroupLinkCommand(-1, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidGroupLinkId);
  });

  it('returns failure when group link is not found', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(null);
    const payload = UpdateGroupLinkHandlerFixture.createPayload();
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.notFound);
  });

  it('returns failure when payload is empty', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(UpdateGroupLinkHandlerFixture.existingGroupLink);
    const payload = {};
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidPayload);
  });

  it('returns failure when title is empty whitespace', async () => {
    // Arrange
    const payload = UpdateGroupLinkHandlerFixture.createPayload({ title: UpdateGroupLinkHandlerFixture.invalidTitle });
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidTitle);
  });

  it('returns failure when color is invalid', async () => {
    // Arrange
    const payload = UpdateGroupLinkHandlerFixture.createPayload({ color: UpdateGroupLinkHandlerFixture.invalidColor as any });
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidColor);
  });

  it('returns failure when parentGroupLinkId equals own id (self-reference)', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(UpdateGroupLinkHandlerFixture.existingGroupLink);
    const payload = { parentGroupLinkId: UpdateGroupLinkHandlerFixture.validGroupLinkId };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidParentGroupLinkId);
  });

  it('returns failure when parentGroupLinkId does not exist', async () => {
    // Arrange
    groupLinkRepository.findOne
      .mockResolvedValueOnce(UpdateGroupLinkHandlerFixture.existingGroupLink)
      .mockResolvedValueOnce(null);
    const payload = UpdateGroupLinkHandlerFixture.createPayloadWithParent();
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.parentGroupLinkNotFound);
  });

  it('updates group link successfully', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(UpdateGroupLinkHandlerFixture.existingGroupLink);
    groupLinkRepository.save.mockResolvedValueOnce(UpdateGroupLinkHandlerFixture.updatedGroupLink);
    const payload = UpdateGroupLinkHandlerFixture.createPayload();
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(groupLinkRepository.save).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('Updated Group');
  });

  it('updates group link with parent successfully', async () => {
    // Arrange
    groupLinkRepository.findOne
      .mockResolvedValueOnce(UpdateGroupLinkHandlerFixture.existingGroupLink)
      .mockResolvedValueOnce(UpdateGroupLinkHandlerFixture.existingParentGroupLink);
    const updatedWithParent = Object.assign(UpdateGroupLinkHandlerFixture.updatedGroupLink, {
      parentGroupLinkId: UpdateGroupLinkHandlerFixture.validParentGroupLinkId,
    });
    groupLinkRepository.save.mockResolvedValueOnce(updatedWithParent);
    const payload = UpdateGroupLinkHandlerFixture.createPayloadWithParent();
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.parentGroupLinkId).toBe(UpdateGroupLinkHandlerFixture.validParentGroupLinkId);
  });

  it('removes parent by setting parentGroupLinkId to null', async () => {
    // Arrange
    const existingWithParent = Object.assign(UpdateGroupLinkHandlerFixture.existingGroupLink, {
      parentGroupLinkId: UpdateGroupLinkHandlerFixture.validParentGroupLinkId,
    });
    groupLinkRepository.findOne.mockResolvedValueOnce(existingWithParent);
    const updatedWithoutParent = Object.assign(UpdateGroupLinkHandlerFixture.updatedGroupLink, {
      parentGroupLinkId: null,
    });
    groupLinkRepository.save.mockResolvedValueOnce(updatedWithoutParent);
    const payload = { parentGroupLinkId: null };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.parentGroupLinkId).toBeNull();
  });
});
