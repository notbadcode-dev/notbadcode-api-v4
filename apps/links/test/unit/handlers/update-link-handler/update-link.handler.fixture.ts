/* eslint-disable @typescript-eslint/no-magic-numbers */
import { type UpdateLinkRequest } from '@apps/links/src/application/requests/update-link.request';
import { Link } from '@apps/links/src/domain/entities/link.entity';

export class UpdateLinkHandlerFixture {
  static readonly existingLink: Link = Object.assign(new Link(), {
    id: 42,
    url: 'https://example.com/page',
    normalizedUrl: 'https://example.com/page',
    title: 'Example page',
    description: 'Initial description',
    faviconUrl: null,
    imagePreviewUrl: null,
    isFavorite: false,
    tagList: ['links'],
    isActive: true,
    lastStatusCode: 200,
    lastCheckedAt: null,
    lastVisitedAt: null,
    userId: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  });

  static updatePayload(description = 'Updated description'): UpdateLinkRequest {
    return {
      url: 'https://example.com/new',
      title: 'Updated title',
      description,
      isFavorite: true,
      tagList: ['updated', 'links'],
    };
  }

  static readonly invalidId = 0;

  static readonly invalidTitle = '   ';

  static readonly invalidTagList = ['valid', '   '];

  static readonly invalidUrl = 'notaurl';

  static readonly validUserId = 7;
}
