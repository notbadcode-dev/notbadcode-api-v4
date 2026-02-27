
import { QueryFailedError } from 'typeorm';

import { ErrorOnFactory } from '@common/types';

import { CreateLinkCommand } from '@apps/links/src/application/commands';
import { CreateLinkHandler } from '@apps/links/src/application/handlers';
import { type CreateLinkRequest } from '@apps/links/src/application/requests';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
import { type IGroupLinkRepository, type ILinkRepository } from '@apps/links/src/domain/ports';

import { CreateLinkHandlerFixture } from './create-link.handler.fixture';

describe('CreateLinkHandler', () => {
  let handler: CreateLinkHandler;
  let linkRepository: jest.Mocked<ILinkRepository>;
  let groupLinkRepository: jest.Mocked<IGroupLinkRepository>;
  let linkValidationService: jest.Mocked<any>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };

  beforeEach(() => {
    linkRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as any;
    groupLinkRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as any;
    linkValidationService = {
      validateCreatePayload: jest.fn(),
      validateUpdatePayload: jest.fn(),
      isDuplicateEntryError: jest.fn(),
      isValidUrl: jest.fn(),
    };
    i18nService = { translate: jest.fn(), t: jest.fn() };

    handler = new CreateLinkHandler(linkRepository, groupLinkRepository, linkValidationService, i18nService as any);
  });

  it('returns failure when url is missing', async () => {
    // Arrange
    const payload = { title: 'No URL' } as CreateLinkRequest;
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.error(LinksErrorMessageConstants.invalidUrl));

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
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.error(LinksErrorMessageConstants.invalidUrl));

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
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.error(LinksErrorMessageConstants.invalidTitle));

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
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.error(LinksErrorMessageConstants.invalidFavoriteFlag));

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
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.error(LinksErrorMessageConstants.invalidTagList));

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
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.error(LinksErrorMessageConstants.invalidGroupLinkId));

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
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.success(payload));

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
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.success(payload));

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
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.success(payload));

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
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.success(payload));

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
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.success(payload));

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.url).toBe('https://example.com/minimal');
  });

  it('returns failure when payload is undefined', async () => {
    // Arrange
    const command = new CreateLinkCommand(undefined as any, CreateLinkHandlerFixture.validUserId);
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.error(LinksErrorMessageConstants.invalidPayload));

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidPayload);
  });

  it('returns failure when title is not a string', async () => {
    // Arrange
    const payload = CreateLinkHandlerFixture.createPayload({ title: 123 as any });
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.error(LinksErrorMessageConstants.invalidTitle));

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidTitle);
  });

  it('returns failure when description is not a string', async () => {
    // Arrange
    const payload = CreateLinkHandlerFixture.createPayload({ description: 123 as any });
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.error(LinksErrorMessageConstants.descriptionRequired));

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.descriptionRequired);
  });

  it('returns failure when description is empty after trimming', async () => {
    // Arrange
    const payload = CreateLinkHandlerFixture.createPayload({ description: '   ' });
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.error(LinksErrorMessageConstants.descriptionRequired));

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.descriptionRequired);
  });

  it('accepts groupLinkId as null explicitly', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);
    linkRepository.save.mockResolvedValueOnce(CreateLinkHandlerFixture.savedLink);
    const payload = CreateLinkHandlerFixture.createPayload({ groupLinkId: null });
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.success(payload));

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.groupLinkId).toBeNull();
  });

  it('returns failure when tagList exceeds maximum length', async () => {
    // Arrange
    const tooManyTags = Array.from({ length: 51 }, (_, i) => `tag${i}`);
    const payload = CreateLinkHandlerFixture.createPayload({ tagList: tooManyTags });
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.error(LinksErrorMessageConstants.invalidTagList));

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidTagList);
  });

  it('returns failure when tag is not a string', async () => {
    // Arrange
    const payload = CreateLinkHandlerFixture.createPayload({ tagList: [123 as any, 'valid'] });
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.error(LinksErrorMessageConstants.invalidTagList));

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidTagList);
  });

  it('returns failure when save throws QueryFailedError with duplicate entry (ER_DUP_ENTRY)', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);

    const duplicateError = Object.create(QueryFailedError.prototype);
    Object.assign(duplicateError, {
      code: 'ER_DUP_ENTRY',
      message: 'Duplicate entry',
      query: '',
      parameters: [],
    });

    linkRepository.save.mockRejectedValueOnce(duplicateError);
    const payload = CreateLinkHandlerFixture.createPayload();
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.success(payload));
    linkValidationService.isDuplicateEntryError.mockReturnValue(true);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.duplicateUrl);
  });

  it('returns failure when save throws QueryFailedError with duplicate entry (errno 1062)', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);

    const duplicateError = Object.create(QueryFailedError.prototype);
    Object.assign(duplicateError, {
      errno: 1062,
      message: 'Duplicate entry',
      query: '',
      parameters: [],
    });

    linkRepository.save.mockRejectedValueOnce(duplicateError);
    const payload = CreateLinkHandlerFixture.createPayload();
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.success(payload));
    linkValidationService.isDuplicateEntryError.mockReturnValue(true);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.duplicateUrl);
  });

  it('rethrows error when save throws non-duplicate QueryFailedError', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);

    const otherError = Object.create(QueryFailedError.prototype);
    Object.assign(otherError, {
      code: 'ER_OTHER_ERROR',
      message: 'Some other database error',
      query: '',
      parameters: [],
    });

    linkRepository.save.mockRejectedValueOnce(otherError);
    const payload = CreateLinkHandlerFixture.createPayload();
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.success(payload));
    linkValidationService.isDuplicateEntryError.mockReturnValue(false);

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(QueryFailedError);
  });

  it('rethrows error when save throws non-QueryFailedError', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);

    const genericError = new Error('Generic error');
    linkRepository.save.mockRejectedValueOnce(genericError);
    const payload = CreateLinkHandlerFixture.createPayload();
    const command = new CreateLinkCommand(payload, CreateLinkHandlerFixture.validUserId);
    linkValidationService.validateCreatePayload.mockReturnValue(ErrorOnFactory.success(payload));

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow('Generic error');
  });
});
