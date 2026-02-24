/* eslint-disable @typescript-eslint/unbound-method */
import { CreateGroupLinkCommand } from '@apps/links/src/application/commands';
import { CreateGroupLinkHandler } from '@apps/links/src/application/handlers';
import { type CreateGroupLinkRequest } from '@apps/links/src/application/requests';
import { GroupLinksErrorMessageConstants } from '@apps/links/src/constants';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports';

import { CreateGroupLinkHandlerFixture } from './create-group-link.handler.fixture';

describe('CreateGroupLinkHandler', () => {
  let handler: CreateGroupLinkHandler;
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
    handler = new CreateGroupLinkHandler(groupLinkRepository, i18nService as any);
  });

  it('returns failure when title is missing', async () => {
    // Arrange
    const payload = { description: 'No title' } as CreateGroupLinkRequest;
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidTitle);
  });

  it('returns failure when title is empty whitespace', async () => {
    // Arrange
    const payload = CreateGroupLinkHandlerFixture.createPayload({ title: CreateGroupLinkHandlerFixture.invalidTitle });
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidTitle);
  });

  it('returns failure when color is invalid', async () => {
    // Arrange
    const payload = CreateGroupLinkHandlerFixture.createPayload({ color: CreateGroupLinkHandlerFixture.invalidColor as any });
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidColor);
  });

  it('returns failure when favorite flag is not boolean', async () => {
    // Arrange
    const payload = CreateGroupLinkHandlerFixture.createPayload({ isFavorite: 'yes' as unknown as boolean });
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidFavoriteFlag);
  });

  it('returns failure when parentGroupLinkId is invalid', async () => {
    // Arrange
    const payload = CreateGroupLinkHandlerFixture.createPayload({ parentGroupLinkId: -1 });
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidParentGroupLinkId);
  });

  it('returns failure when parentGroupLinkId does not exist', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(null);
    const payload = CreateGroupLinkHandlerFixture.createPayloadWithParent();
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(groupLinkRepository.findOne).toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.parentGroupLinkNotFound);
  });

  it('creates a group link without parent successfully', async () => {
    // Arrange
    groupLinkRepository.save.mockResolvedValueOnce(CreateGroupLinkHandlerFixture.savedGroupLink);
    const payload = CreateGroupLinkHandlerFixture.createPayload();
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(groupLinkRepository.save).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe(payload.title);
    expect(result.data?.parentGroupLinkId).toBeNull();
  });

  it('creates a group link with parent successfully', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(CreateGroupLinkHandlerFixture.existingParentGroupLink);
    groupLinkRepository.save.mockResolvedValueOnce(CreateGroupLinkHandlerFixture.savedGroupLinkWithParent);
    const payload = CreateGroupLinkHandlerFixture.createPayloadWithParent();
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(groupLinkRepository.findOne).toHaveBeenCalled();
    expect(groupLinkRepository.save).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data?.parentGroupLinkId).toBe(CreateGroupLinkHandlerFixture.validParentGroupLinkId);
  });

  it('creates a group link with minimal payload (title only)', async () => {
    // Arrange
    const minimalSaved = Object.assign(CreateGroupLinkHandlerFixture.savedGroupLink, {
      title: 'Minimal Group',
      description: null,
      color: null,
      icon: null,
    });
    groupLinkRepository.save.mockResolvedValueOnce(minimalSaved);
    const payload = CreateGroupLinkHandlerFixture.createPayloadMinimal();
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('Minimal Group');
  });

  it('returns failure when payload is undefined', async () => {
    // Arrange
    const command = new CreateGroupLinkCommand(undefined as any, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidPayload);
  });

  it('returns failure when description is not a string', async () => {
    // Arrange
    const payload = CreateGroupLinkHandlerFixture.createPayload({ description: 123 as any });
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidDescription);
  });

  it('returns failure when description exceeds maximum length', async () => {
    // Arrange
    const tooLongDescription = 'a'.repeat(501);
    const payload = CreateGroupLinkHandlerFixture.createPayload({ description: tooLongDescription });
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidDescription);
  });

  it('returns failure when icon is not a string', async () => {
    // Arrange
    const payload = CreateGroupLinkHandlerFixture.createPayload({ icon: 123 as any });
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidIcon);
  });

  it('returns failure when icon exceeds maximum length', async () => {
    // Arrange
    const tooLongIcon = 'a'.repeat(256);
    const payload = CreateGroupLinkHandlerFixture.createPayload({ icon: tooLongIcon });
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidIcon);
  });

  it('accepts parentGroupLinkId as null explicitly', async () => {
    // Arrange
    groupLinkRepository.save.mockResolvedValueOnce(CreateGroupLinkHandlerFixture.savedGroupLink);
    const payload = CreateGroupLinkHandlerFixture.createPayload({ parentGroupLinkId: null });
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.parentGroupLinkId).toBeNull();
  });

  it('returns failure when color is null', async () => {
    // Arrange
    const payload = CreateGroupLinkHandlerFixture.createPayload({ color: null as any });
    const command = new CreateGroupLinkCommand(payload, CreateGroupLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(GroupLinksErrorMessageConstants.invalidColor);
  });
});
