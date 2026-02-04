/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GroupLink } from '@apps/links/src/domain/entities/group-link.entity';
import { Link } from '@apps/links/src/domain/entities/link.entity';

export class LinkByIdHandlerFixture {
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

  static readonly validLinkWithGroup: Link = Object.assign(new Link(), {
    id: 2,
    url: 'https://example.com/grouped',
    normalizedUrl: 'https://example.com/grouped',
    title: 'Grouped link',
    description: 'A link in a group',
    faviconUrl: null,
    imagePreviewUrl: null,
    isFavorite: false,
    tagList: ['test'],
    isActive: true,
    lastStatusCode: 200,
    lastCheckedAt: null,
    lastVisitedAt: null,
    userId: 1,
    groupLinkId: 5,
    groupLink: Object.assign(new GroupLink(), {
      id: 5,
      userId: 1,
      title: 'Development',
      description: null,
      color: { r: 59, g: 130, b: 246 },
      icon: 'code',
      parentGroupLinkId: null,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  });

  static readonly notFoundId = 999;

  static readonly validUserId = 1;
}
