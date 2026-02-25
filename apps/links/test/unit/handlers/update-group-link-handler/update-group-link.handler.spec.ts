 
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

  it('returns failure when parent cycle is detected', async () => {
    // Arrange
    const groupLink = { ...UpdateGroupLinkHandlerFixture.existingGroupLink, id: 1 };
    const parentGroupLink = { ...UpdateGroupLinkHandlerFixture.existingParentGroupLink, id: 2, parentGroupLinkId: null };
    const grandparentGroupLink = { ...UpdateGroupLinkHandlerFixture.existingParentGroupLink, id: 3, parentGroupLinkId: 1 };

    groupLinkRepository.findOne
      .mockResolvedValueOnce(groupLink)
      .mockResolvedValueOnce(parentGroupLink)
      .mockResolvedValueOnce(grandparentGroupLink);

    const payload = { parentGroupLinkId: 2 };
    const command = new UpdateGroupLinkCommand(1, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidParentGroupLinkId);
  });

  it('returns failure when payload is undefined', async () => {
    // Arrange
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, undefined as any, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidPayload);
  });

  it('returns failure when title is not a string', async () => {
    // Arrange
    const payload = { title: 123 as any };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidTitle);
  });

  it('accepts description as null explicitly', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(UpdateGroupLinkHandlerFixture.existingGroupLink);
    groupLinkRepository.save.mockResolvedValueOnce({ ...UpdateGroupLinkHandlerFixture.updatedGroupLink, description: null });
    const payload = { description: null };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.description).toBeNull();
  });

  it('returns failure when description is not a string', async () => {
    // Arrange
    const payload = { description: 123 as any };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidDescription);
  });

  it('returns failure when description exceeds maximum length', async () => {
    // Arrange
    const tooLongDescription = 'a'.repeat(501);
    const payload = { description: tooLongDescription };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidDescription);
  });

  it('accepts color as null explicitly', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(UpdateGroupLinkHandlerFixture.existingGroupLink);
    groupLinkRepository.save.mockResolvedValueOnce({ ...UpdateGroupLinkHandlerFixture.updatedGroupLink, color: null });
    const payload = { color: null };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.color).toBeNull();
  });

  it('accepts icon as null explicitly', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(UpdateGroupLinkHandlerFixture.existingGroupLink);
    groupLinkRepository.save.mockResolvedValueOnce({ ...UpdateGroupLinkHandlerFixture.updatedGroupLink, icon: null });
    const payload = { icon: null };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.icon).toBeNull();
  });

  it('returns failure when icon is not a string', async () => {
    // Arrange
    const payload = { icon: 123 as any };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidIcon);
  });

  it('returns failure when icon exceeds maximum length', async () => {
    // Arrange
    const tooLongIcon = 'a'.repeat(256);
    const payload = { icon: tooLongIcon };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidIcon);
  });

  it('returns failure when parentGroupLinkId is not a valid integer', async () => {
    // Arrange
    const payload = { parentGroupLinkId: -1 };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidParentGroupLinkId);
  });

  it('returns failure when isFavorite is not a boolean', async () => {
    // Arrange
    const payload = { isFavorite: 'yes' as any };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidFavoriteFlag);
  });

  it('returns failure when color is not an object', async () => {
    // Arrange
    const payload = { color: 'red' as any };
    const command = new UpdateGroupLinkCommand(UpdateGroupLinkHandlerFixture.validGroupLinkId, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidColor);
  });

  it('detects cycle when parent chain loops back to itself', async () => {
    // Arrange
    // Create a self-referencing cycle: group2 -> group3 -> group4 -> group3 (loop)
    const groupLink1 = { ...UpdateGroupLinkHandlerFixture.existingGroupLink, id: 1, parentGroupLinkId: null };
    const groupLink2 = { ...UpdateGroupLinkHandlerFixture.existingParentGroupLink, id: 2, parentGroupLinkId: 3 };
    const groupLink3 = { ...UpdateGroupLinkHandlerFixture.existingParentGroupLink, id: 3, parentGroupLinkId: 4 };
    const groupLink4 = { ...UpdateGroupLinkHandlerFixture.existingParentGroupLink, id: 4, parentGroupLinkId: 3 };

    groupLinkRepository.findOne
      .mockResolvedValueOnce(groupLink1) // Initial findOne for group1
      .mockResolvedValueOnce(groupLink2) // Parent check: verify group2 exists
      .mockResolvedValueOnce(groupLink3) // Cycle check: get group3 (parent of group2)
      .mockResolvedValueOnce(groupLink4) // Cycle check: get group4 (parent of group3)
      .mockResolvedValueOnce(groupLink3); // Cycle check: get group3 again (parent of group4) - creates cycle

    const payload = { parentGroupLinkId: 2 };
    const command = new UpdateGroupLinkCommand(1, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidParentGroupLinkId);
  });

  it('allows update when parent not found during cycle check (breaks chain safely)', async () => {
    // Arrange
    const groupLink = { ...UpdateGroupLinkHandlerFixture.existingGroupLink, id: 1 };
    const parentGroupLink = { ...UpdateGroupLinkHandlerFixture.existingParentGroupLink, id: 2, parentGroupLinkId: 999 };

    groupLinkRepository.findOne
      .mockResolvedValueOnce(groupLink)
      .mockResolvedValueOnce(parentGroupLink)
      .mockResolvedValueOnce(null);
    groupLinkRepository.save.mockResolvedValueOnce({ ...groupLink, parentGroupLinkId: 2 });

    const payload = { parentGroupLinkId: 2 };
    const command = new UpdateGroupLinkCommand(1, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
  });

  it('allows update when parent chain reaches root without cycles', async () => {
    // Arrange
    // Create a valid chain: group1 -> group2 -> group3 -> null (root)
    const groupLink1 = { ...UpdateGroupLinkHandlerFixture.existingGroupLink, id: 1, parentGroupLinkId: null };
    const groupLink2 = { ...UpdateGroupLinkHandlerFixture.existingParentGroupLink, id: 2, parentGroupLinkId: 3 };
    const groupLink3 = { ...UpdateGroupLinkHandlerFixture.existingParentGroupLink, id: 3, parentGroupLinkId: null };

    groupLinkRepository.findOne
      .mockResolvedValueOnce(groupLink1) // Initial findOne for group1
      .mockResolvedValueOnce(groupLink2) // Parent check: verify group2 exists
      .mockResolvedValueOnce(groupLink2) // Cycle check: get group2 (starts at parentGroupLinkId=3)
      .mockResolvedValueOnce(groupLink3); // Cycle check: get group3 (parentGroupLinkId=null, reaches root)
    groupLinkRepository.save.mockResolvedValueOnce({ ...groupLink1, parentGroupLinkId: 2 });

    const payload = { parentGroupLinkId: 2 };
    const command = new UpdateGroupLinkCommand(1, payload, UpdateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.parentGroupLinkId).toBe(2);
  });
});
