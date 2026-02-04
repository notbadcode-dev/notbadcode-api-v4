/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Link } from '@apps/links/src/domain/entities/link.entity';

export class DeleteLinkHandlerFixture {
  static readonly validLink: Link = Object.assign(new Link(), {
    id: 1,
    url: 'https://example.com',
    normalizedUrl: 'https://example.com',
    title: 'Example',
    description: 'Desc',
    faviconUrl: null,
    imagePreviewUrl: null,
    isFavorite: false,
    tagList: ['test'],
    isActive: true,
    lastStatusCode: 200,
    lastCheckedAt: null,
    lastVisitedAt: null,
    userId: 1,
    groupLinkId: null,
    groupLink: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  });

  static readonly notFoundId = 999;

  static readonly validUserId = 1;
}
