import { LinkService } from '@apps/links/src/application/services';
import { Link } from '@apps/links/src/domain/entities';

describe('LinkService', () => {
  let service: LinkService;
  let link: Link;

  beforeEach(() => {
    service = new LinkService();
    link = {
      id: 1,
      userId: 123,
      url: 'https://old-url.com',
      normalizedUrl: 'https://old-url.com',
      title: 'Old Title',
      description: 'Old Description',
      isFavorite: false,
      tagList: ['old-tag'],
      groupLinkId: null,
      groupLink: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as Link;
  });

  describe('updateLink', () => {
    it('updates url and normalizedUrl when url is provided', () => {
      // Arrange
      const payload = { url: 'https://NEW-URL.com' };

      // Act
      const result = service.updateLink(link, payload);

      // Assert
      expect(result.url).toBe('https://NEW-URL.com');
      expect(result.normalizedUrl).toBe('https://new-url.com');
    });

    it('updates title when title is provided', () => {
      // Arrange
      const payload = { title: 'New Title' };

      // Act
      const result = service.updateLink(link, payload);

      // Assert
      expect(result.title).toBe('New Title');
    });

    it('updates description when description is provided', () => {
      // Arrange
      const payload = { description: 'New Description' };

      // Act
      const result = service.updateLink(link, payload);

      // Assert
      expect(result.description).toBe('New Description');
    });

    it('updates isFavorite when isFavorite is provided', () => {
      // Arrange
      const payload = { isFavorite: true };

      // Act
      const result = service.updateLink(link, payload);

      // Assert
      expect(result.isFavorite).toBe(true);
    });

    it('updates tagList when tagList is provided', () => {
      // Arrange
      const payload = { tagList: ['new-tag-1', 'new-tag-2'] };

      // Act
      const result = service.updateLink(link, payload);

      // Assert
      expect(result.tagList).toEqual(['new-tag-1', 'new-tag-2']);
    });

    it('updates groupLinkId when groupLinkId is provided', () => {
      // Arrange
      const payload = { groupLinkId: 456 };

      // Act
      const result = service.updateLink(link, payload);

      // Assert
      expect(result.groupLinkId).toBe(456);
    });

    it('updates multiple fields at once', () => {
      // Arrange
      const payload = {
        url: 'https://multi-update.com',
        title: 'Multi Update',
        isFavorite: true,
        tagList: ['tag1', 'tag2'],
      };

      // Act
      const result = service.updateLink(link, payload);

      // Assert
      expect(result.url).toBe('https://multi-update.com');
      expect(result.normalizedUrl).toBe('https://multi-update.com');
      expect(result.title).toBe('Multi Update');
      expect(result.isFavorite).toBe(true);
      expect(result.tagList).toEqual(['tag1', 'tag2']);
    });

    it('does not modify link when payload is empty', () => {
      // Arrange
      const payload = {};
      const originalUrl = link.url;
      const originalTitle = link.title;

      // Act
      const result = service.updateLink(link, payload);

      // Assert
      expect(result.url).toBe(originalUrl);
      expect(result.title).toBe(originalTitle);
    });

    it('returns the same link instance', () => {
      // Arrange
      const payload = { title: 'Test' };

      // Act
      const result = service.updateLink(link, payload);

      // Assert
      expect(result).toBe(link);
    });

    it('sets groupLinkId to null when provided', () => {
      // Arrange
      link.groupLinkId = 999;
      const payload = { groupLinkId: null };

      // Act
      const result = service.updateLink(link, payload);

      // Assert
      expect(result.groupLinkId).toBeNull();
    });

    it('updates description to empty string when provided', () => {
      // Arrange
      const payload = { description: '' };

      // Act
      const result = service.updateLink(link, payload);

      // Assert
      expect(result.description).toBe('');
    });

    it('updates tagList to empty array when provided', () => {
      // Arrange
      const payload = { tagList: [] };

      // Act
      const result = service.updateLink(link, payload);

      // Assert
      expect(result.tagList).toEqual([]);
    });
  });
});
