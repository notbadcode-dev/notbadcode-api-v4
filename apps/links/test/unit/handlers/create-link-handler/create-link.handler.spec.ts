/* eslint-disable @typescript-eslint/unbound-method */
import { CreateLinkCommand } from '@apps/links/src/application/commands/create-link.command';
import { CreateLinkHandler } from '@apps/links/src/application/handlers/create-link.handler';
import { type CreateLinkRequest } from '@apps/links/src/application/requests/create-link.request';
import { LinksErrorMessageConstants } from '@apps/links/src/constants/links-error-message.constants';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports/group-link-repository.port';
import { type ILinkRepository } from '@apps/links/src/domain/ports/link-repository.port';

import { CreateLinkHandlerFixture } from './create-link.handler.fixture';

describe('CreateLinkHandler', () => {
  let handler: CreateLinkHandler;
  let linkRepository: jest.Mocked<ILinkRepository>;
  let groupLinkRepository: jest.Mocked<IGroupLinkRepository>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };

  beforeEach(() => {
    linkRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    groupLinkRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    i18nService = { translate: jest.fn(), t: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    handler = new CreateLinkHandler(linkRepository, groupLinkRepository, i18nService as any);
  });

  it('returns failure when url is missing', async () => {
    // Arrange
    const payload = { title: 'No URL' } as CreateLinkRequest;
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidUrl);
  });

  it('returns failure when url is invalid', async () => {
    // Arrange
    const payload = CreateLinkHandlerFixture.createPayload({ url: CreateLinkHandlerFixture.invalidUrl });
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidUrl);
  });

  it('returns failure when title is empty whitespace', async () => {
    // Arrange
    const payload = CreateLinkHandlerFixture.createPayload({ title: CreateLinkHandlerFixture.invalidTitle });
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidTitle);
  });

  it('returns failure when favorite flag is not boolean', async () => {
    // Arrange
    const payload = CreateLinkHandlerFixture.createPayload({ isFavorite: 'yes' as unknown as boolean });
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidFavoriteFlag);
  });

  it('returns failure when tag list contains invalid entries', async () => {
    // Arrange
    const payload = CreateLinkHandlerFixture.createPayload({ tagList: CreateLinkHandlerFixture.invalidTagList });
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidTagList);
  });

  it('returns failure when groupLinkId is invalid', async () => {
    // Arrange
    const payload = CreateLinkHandlerFixture.createPayload({ groupLinkId: -1 });
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidGroupLinkId);
  });

  it('returns failure when groupLinkId does not exist', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);
    groupLinkRepository.findOne.mockResolvedValueOnce(null);
    const payload = CreateLinkHandlerFixture.createPayloadWithGroup();
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(groupLinkRepository.findOne).toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.groupLinkNotFound);
  });

  it('returns failure when normalized url already exists for user', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(CreateLinkHandlerFixture.savedLink);
    const payload = CreateLinkHandlerFixture.createPayload();
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.duplicateUrl);
  });

  it('creates a link without group successfully', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);
    linkRepository.save.mockResolvedValueOnce(CreateLinkHandlerFixture.savedLink);
    const payload = CreateLinkHandlerFixture.createPayload();
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(linkRepository.save).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data?.url).toBe(payload.url);
    expect(result.data?.groupLinkId).toBeNull();
  });

  it('creates a link with group successfully', async () => {
    // Arrange
    groupLinkRepository.findOne.mockResolvedValueOnce(CreateLinkHandlerFixture.existingGroupLink);
    linkRepository.findOne.mockResolvedValueOnce(null);
    linkRepository.save.mockResolvedValueOnce(CreateLinkHandlerFixture.savedLinkWithGroup);
    const payload = CreateLinkHandlerFixture.createPayloadWithGroup();
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(groupLinkRepository.findOne).toHaveBeenCalled();
    expect(linkRepository.save).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data?.groupLinkId).toBe(CreateLinkHandlerFixture.validGroupLinkId);
  });

  it('creates a link with minimal payload (url only)', async () => {
    // Arrange
    const minimalSaved = Object.assign(CreateLinkHandlerFixture.savedLink, {
      url: 'https://example.com/minimal',
      normalizedUrl: 'https://example.com/minimal',
      title: null,
      description: null,
      tagList: [],
    });
    linkRepository.findOne.mockResolvedValueOnce(null);
    linkRepository.save.mockResolvedValueOnce(minimalSaved);
    const payload = CreateLinkHandlerFixture.createPayloadMinimal();
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.url).toBe('https://example.com/minimal');
  });
});
