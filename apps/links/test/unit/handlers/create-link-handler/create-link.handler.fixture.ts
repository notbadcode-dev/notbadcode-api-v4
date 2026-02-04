/* eslint-disable @typescript-eslint/no-magic-numbers */
import { type CreateLinkRequest } from '@apps/links/src/application/requests/create-link.request';
import { Link } from '@apps/links/src/domain/entities/link.entity';
import { GroupLink } from '@apps/links/src/domain/entities/group-link.entity';

export class CreateLinkHandlerFixture {
  static readonly validUserId = 7;

  static readonly validGroupLinkId = 3;

  static createPayload(overrides?: Partial<CreateLinkRequest>): CreateLinkRequest {
    return {
      url: 'https://example.com/new-link',
      title: 'New link title',
      description: 'A new link description',
      isFavorite: false,
      tagList: ['nestjs', 'typescript'],
      ...overrides,
    };
  }

  static createPayloadWithGroup(overrides?: Partial<CreateLinkRequest>): CreateLinkRequest {
    return {
      ...CreateLinkHandlerFixture.createPayload(),
      groupLinkId: CreateLinkHandlerFixture.validGroupLinkId,
      ...overrides,
    };
  }

  static createPayloadMinimal(): CreateLinkRequest {
    return { url: 'https://example.com/minimal' };
  }

  static get savedLink(): Link {
    return Object.assign(new Link(), {
      id: 1,
      userId: CreateLinkHandlerFixture.validUserId,
      url: 'https://example.com/new-link',
      normalizedUrl: 'https://example.com/new-link',
      title: 'New link title',
      description: 'A new link description',
      faviconUrl: null,
      imagePreviewUrl: null,
      isFavorite: false,
      tagList: ['nestjs', 'typescript'],
      isActive: true,
      lastStatusCode: 0,
      lastCheckedAt: null,
      lastVisitedAt: null,
      groupLinkId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    });
  }

  static get savedLinkWithGroup(): Link {
    return Object.assign(new Link(), {
      ...CreateLinkHandlerFixture.savedLink,
      id: 2,
      groupLinkId: CreateLinkHandlerFixture.validGroupLinkId,
    });
  }

  static get existingGroupLink(): GroupLink {
    return Object.assign(new GroupLink(), {
      id: CreateLinkHandlerFixture.validGroupLinkId,
      userId: CreateLinkHandlerFixture.validUserId,
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
  }

  static readonly invalidUrl = 'notaurl';

  static readonly invalidTitle = '   ';

  static readonly invalidTagList = ['valid', '   '];
}
