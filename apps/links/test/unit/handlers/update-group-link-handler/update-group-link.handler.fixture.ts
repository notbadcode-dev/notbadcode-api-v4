/* eslint-disable @typescript-eslint/no-magic-numbers */
import { type UpdateGroupLinkRequest } from '@apps/links/src/application/requests';
import { GroupLink } from '@apps/links/src/domain/entities';

export class UpdateGroupLinkHandlerFixture {
  static readonly validUserId = 7;

  static readonly validGroupLinkId = 1;

  static readonly validParentGroupLinkId = 5;

  static createPayload(overrides?: Partial<UpdateGroupLinkRequest>): UpdateGroupLinkRequest {
    return {
      title: 'Updated Group',
      description: 'Updated description',
      color: { r: 100, g: 150, b: 200 },
      icon: 'star',
      isFavorite: true,
      ...overrides,
    };
  }

  static createPayloadWithParent(overrides?: Partial<UpdateGroupLinkRequest>): UpdateGroupLinkRequest {
    return {
      ...UpdateGroupLinkHandlerFixture.createPayload(),
      parentGroupLinkId: UpdateGroupLinkHandlerFixture.validParentGroupLinkId,
      ...overrides,
    };
  }

  static get existingGroupLink(): GroupLink {
    return Object.assign(new GroupLink(), {
      id: UpdateGroupLinkHandlerFixture.validGroupLinkId,
      userId: UpdateGroupLinkHandlerFixture.validUserId,
      title: 'Original Group',
      description: 'Original description',
      color: { r: 255, g: 128, b: 0 },
      icon: 'folder',
      parentGroupLinkId: null,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    });
  }

  static get updatedGroupLink(): GroupLink {
    return Object.assign(new GroupLink(), {
      ...UpdateGroupLinkHandlerFixture.existingGroupLink,
      title: 'Updated Group',
      description: 'Updated description',
      color: { r: 100, g: 150, b: 200 },
      icon: 'star',
      isFavorite: true,
    });
  }

  static get existingParentGroupLink(): GroupLink {
    return Object.assign(new GroupLink(), {
      id: UpdateGroupLinkHandlerFixture.validParentGroupLinkId,
      userId: UpdateGroupLinkHandlerFixture.validUserId,
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

  static readonly invalidColor = { r: -1, g: 0, b: 0 };
}
