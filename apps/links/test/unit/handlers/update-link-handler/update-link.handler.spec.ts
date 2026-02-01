/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateLinkCommand } from '@apps/links/src/application/commands/update-link.command';
import { UpdateLinkHandler } from '@apps/links/src/application/handlers/update-link.handler';
import { type UpdateLinkRequest } from '@apps/links/src/application/requests/update-link.request';
import { type LinkService } from '@apps/links/src/application/services/link.service';
import { LinksErrorMessageConstants } from '@apps/links/src/constants/links-error-message.constants';
import { type ILinkRepository } from '@apps/links/src/domain/ports/link-repository.port';

import { UpdateLinkHandlerFixture } from './update-link.handler.fixture';

describe('UpdateLinkHandler', () => {
  let handler: UpdateLinkHandler;
  let linkRepository: jest.Mocked<ILinkRepository>;
  let linkService: jest.Mocked<LinkService>;
  let i18nService: { translate: jest.Mock; t: jest.Mock };

  beforeEach(() => {
    linkRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    linkService = { updateLink: jest.fn() } as unknown as jest.Mocked<LinkService>;
    i18nService = { translate: jest.fn(), t: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    handler = new UpdateLinkHandler(linkRepository, linkService, i18nService as any);
  });

  it('returns failure when id is invalid', async () => {
    // Arrange
    const command = new UpdateLinkCommand(UpdateLinkHandlerFixture.invalidId, UpdateLinkHandlerFixture.updatePayload(), UpdateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(linkRepository.findOne).not.toHaveBeenCalled();
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidLinkId);
  });

  it('returns failure when description is empty', async () => {
    // Arrange
    const payload = UpdateLinkHandlerFixture.updatePayload('   ');
    const command = new UpdateLinkCommand(UpdateLinkHandlerFixture.existingLink.id, payload, UpdateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(linkRepository.findOne).not.toHaveBeenCalled();
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.descriptionRequired);
  });

  it('returns failure when url is invalid', async () => {
    // Arrange
    const payload = { ...UpdateLinkHandlerFixture.updatePayload(), url: UpdateLinkHandlerFixture.invalidUrl };
    const command = new UpdateLinkCommand(UpdateLinkHandlerFixture.existingLink.id, payload, UpdateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidUrl);
  });

  it('returns failure when title is invalid', async () => {
    // Arrange
    const payload = { ...UpdateLinkHandlerFixture.updatePayload(), title: UpdateLinkHandlerFixture.invalidTitle };
    const command = new UpdateLinkCommand(UpdateLinkHandlerFixture.existingLink.id, payload, UpdateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidTitle);
  });

  it('returns failure when favorite flag is invalid', async () => {
    // Arrange
    const payload = { ...UpdateLinkHandlerFixture.updatePayload(), isFavorite: undefined } as unknown as UpdateLinkRequest;
    const command = new UpdateLinkCommand(UpdateLinkHandlerFixture.existingLink.id, payload, UpdateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidFavoriteFlag);
  });

  it('returns failure when tag list is invalid', async () => {
    // Arrange
    const payload = { ...UpdateLinkHandlerFixture.updatePayload(), tagList: UpdateLinkHandlerFixture.invalidTagList };
    const command = new UpdateLinkCommand(UpdateLinkHandlerFixture.existingLink.id, payload, UpdateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidTagList);
  });

  it('returns failure when link is not found', async () => {
    // Arrange
    linkRepository.findOne.mockResolvedValueOnce(null);
    const command = new UpdateLinkCommand(UpdateLinkHandlerFixture.existingLink.id, UpdateLinkHandlerFixture.updatePayload());

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(linkRepository.findOne).toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.notFound);
  });

  it('updates the link fields when link exists', async () => {
    // Arrange
    const link = UpdateLinkHandlerFixture.existingLink;
    linkRepository.findOne.mockResolvedValueOnce(link);
    linkRepository.save.mockResolvedValueOnce(link);

    const payload = UpdateLinkHandlerFixture.updatePayload(UpdateLinkHandlerFixture?.existingLink?.description ?? '');
    const command = new UpdateLinkCommand(link.id, payload, UpdateLinkHandlerFixture.validUserId);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(linkService.updateLink).toHaveBeenCalledWith(link, payload);
    expect(linkRepository.save).toHaveBeenCalledWith(link);
    expect(result.success).toBe(true);
    expect(result.data?.description).toBe(link.description);
  });
});
