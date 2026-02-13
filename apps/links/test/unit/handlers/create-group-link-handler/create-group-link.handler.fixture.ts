/* eslint-disable @typescript-eslint/no-magic-numbers */
import { type CreateGroupLinkRequest } from '@apps/links/src/application/requests';
import { GroupLink } from '@apps/links/src/domain/entities';

export class CreateGroupLinkHandlerFixture {
  static readonly validUserId = 7;

  static readonly validParentGroupLinkId = 5;

  static createPayload(overrides?: Partial<CreateGroupLinkRequest>): CreateGroupLinkRequest {
    return {
      title: 'My Group',
      description: 'A collection of useful links',
      color: { r: 255, g: 128, b: 0 },
      icon: 'folder',
      isFavorite: false,
      ...overrides,
    };
  }

  static createPayloadWithParent(overrides?: Partial<CreateGroupLinkRequest>): CreateGroupLinkRequest {
    return {
      ...CreateGroupLinkHandlerFixture.createPayload(),
      parentGroupLinkId: CreateGroupLinkHandlerFixture.validParentGroupLinkId,
      ...overrides,
    };
  }

  static createPayloadMinimal(): CreateGroupLinkRequest {
    return { title: 'Minimal Group' };
  }

  static get savedGroupLink(): GroupLink {
    return Object.assign(new GroupLink(), {
      id: 1,
      userId: CreateGroupLinkHandlerFixture.validUserId,
      title: 'My Group',
      description: 'A collection of useful links',
      color: { r: 255, g: 128, b: 0 },
      icon: 'folder',
      parentGroupLinkId: null,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    });
  }

  static get savedGroupLinkWithParent(): GroupLink {
    return Object.assign(new GroupLink(), {
      ...CreateGroupLinkHandlerFixture.savedGroupLink,
      id: 2,
      parentGroupLinkId: CreateGroupLinkHandlerFixture.validParentGroupLinkId,
    });
  }

  static get existingParentGroupLink(): GroupLink {
    return Object.assign(new GroupLink(), {
      id: CreateGroupLinkHandlerFixture.validParentGroupLinkId,
      userId: CreateGroupLinkHandlerFixture.validUserId,
      title: 'Parent Group',
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

  static readonly invalidTitle = '   ';

  static readonly invalidColor = { r: 300, g: 0, b: 0 };

  static readonly invalidIcon = '';
}
