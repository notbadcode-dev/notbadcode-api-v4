/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateLinkCommand } from '@apps/links/src/application/commands';
import { UpdateLinkHandler } from '@apps/links/src/application/handlers';
import { type UpdateLinkRequest } from '@apps/links/src/application/requests';
import { type LinkService } from '@apps/links/src/application/services';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
import { type IGroupLinkRepository, type ILinkRepository } from '@apps/links/src/domain/ports';

import { UpdateLinkHandlerFixture } from './update-link.handler.fixture';

describe('UpdateLinkHandler', () => {
  let handler: UpdateLinkHandler;
  let linkRepository: jest.Mocked<ILinkRepository>;
  let groupLinkRepository: jest.Mocked<IGroupLinkRepository>;
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
    groupLinkRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    linkService = { updateLink: jest.fn() } as unknown as jest.Mocked<LinkService>;
    i18nService = { translate: jest.fn(), t: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    handler = new UpdateLinkHandler(linkRepository, groupLinkRepository, linkService, i18nService as any);
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
    const payload = { ...UpdateLinkHandlerFixture.updatePayload(), isFavorite: 'not-a-boolean' } as unknown as UpdateLinkRequest;
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

  describe('groupLinkId scenarios', () => {
    it('adds link to a group when groupLinkId is provided', async () => {
      // Arrange
      const link = UpdateLinkHandlerFixture.existingLink;
      const updatedLink = Object.assign(new (link.constructor as new () => typeof link)(), { ...link, groupLinkId: UpdateLinkHandlerFixture.validGroupLink.id });
      linkRepository.findOne.mockResolvedValueOnce(link);
      groupLinkRepository.findOne.mockResolvedValueOnce(UpdateLinkHandlerFixture.validGroupLink);
      linkRepository.save.mockResolvedValueOnce(updatedLink);

      const payload = UpdateLinkHandlerFixture.updatePayloadWithGroup(UpdateLinkHandlerFixture.validGroupLink.id);
      const command = new UpdateLinkCommand(link.id, payload, UpdateLinkHandlerFixture.validUserId);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(groupLinkRepository.findOne).toHaveBeenCalled();
      expect(linkService.updateLink).toHaveBeenCalledWith(link, payload);
      expect(result.success).toBe(true);
      expect(result.data?.groupLinkId).toBe(UpdateLinkHandlerFixture.validGroupLink.id);
    });

    it('moves link from one group to another', async () => {
      // Arrange
      const link = UpdateLinkHandlerFixture.existingLinkWithGroup;
      const updatedLink = Object.assign(new (link.constructor as new () => typeof link)(), { ...link, groupLinkId: UpdateLinkHandlerFixture.anotherGroupLink.id });
      linkRepository.findOne.mockResolvedValueOnce(link);
      groupLinkRepository.findOne.mockResolvedValueOnce(UpdateLinkHandlerFixture.anotherGroupLink);
      linkRepository.save.mockResolvedValueOnce(updatedLink);

      const payload = UpdateLinkHandlerFixture.updatePayloadWithGroup(UpdateLinkHandlerFixture.anotherGroupLink.id);
      const command = new UpdateLinkCommand(link.id, payload, UpdateLinkHandlerFixture.validUserId);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(groupLinkRepository.findOne).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.groupLinkId).toBe(UpdateLinkHandlerFixture.anotherGroupLink.id);
    });

    it('removes link from group when groupLinkId is null', async () => {
      // Arrange
      const link = UpdateLinkHandlerFixture.existingLinkWithGroup;
      const updatedLink = Object.assign(new (link.constructor as new () => typeof link)(), { ...link, groupLinkId: null });
      linkRepository.findOne.mockResolvedValueOnce(link);
      linkRepository.save.mockResolvedValueOnce(updatedLink);

      const payload = UpdateLinkHandlerFixture.updatePayloadWithGroup(null);
      const command = new UpdateLinkCommand(link.id, payload, UpdateLinkHandlerFixture.validUserId);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(groupLinkRepository.findOne).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.groupLinkId).toBeNull();
    });

    it('returns failure when groupLinkId does not exist', async () => {
      // Arrange
      const link = UpdateLinkHandlerFixture.existingLink;
      linkRepository.findOne.mockResolvedValueOnce(link);
      groupLinkRepository.findOne.mockResolvedValueOnce(null);

      const payload = UpdateLinkHandlerFixture.updatePayloadWithGroup(999);
      const command = new UpdateLinkCommand(link.id, payload, UpdateLinkHandlerFixture.validUserId);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(groupLinkRepository.findOne).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.groupLinkNotFound);
    });

    it('returns failure when groupLinkId is not a valid integer', async () => {
      // Arrange
      const payload = { ...UpdateLinkHandlerFixture.updatePayload(), groupLinkId: -1 };
      const command = new UpdateLinkCommand(UpdateLinkHandlerFixture.existingLink.id, payload, UpdateLinkHandlerFixture.validUserId);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.success).toBe(false);
      expect(result.messageList?.[0]?.message).toBe(LinksErrorMessageConstants.invalidGroupLinkId);
    });
  });
});
