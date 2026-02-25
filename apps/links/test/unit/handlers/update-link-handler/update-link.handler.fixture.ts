 
import { type UpdateLinkRequest } from '@apps/links/src/application/requests';
import { GroupLink, Link } from '@apps/links/src/domain/entities';

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
    groupLinkId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  });

  static readonly existingLinkWithGroup: Link = Object.assign(new Link(), {
    ...UpdateLinkHandlerFixture.existingLink,
    id: 43,
    groupLinkId: 5,
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

  static updatePayloadWithGroup(groupLinkId: number | null): UpdateLinkRequest {
    return {
      ...UpdateLinkHandlerFixture.updatePayload(),
      groupLinkId,
    };
  }

  static readonly validGroupLink: GroupLink = Object.assign(new GroupLink(), {
    id: 5,
    userId: 7,
    title: 'Development',
    description: null,
    color: null,
    icon: null,
    parentGroupLinkId: null,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  });

  static readonly anotherGroupLink: GroupLink = Object.assign(new GroupLink(), {
    id: 10,
    userId: 7,
    title: 'Design',
    description: null,
    color: null,
    icon: null,
    parentGroupLinkId: null,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  });

  static readonly invalidId = 0;

  static readonly invalidTitle = '   ';

  static readonly invalidTagList = ['valid', '   '];

  static readonly invalidUrl = 'notaurl';

  static readonly validUserId = 7;
}
