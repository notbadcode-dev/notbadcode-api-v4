 
import { GroupLink } from '@apps/links/src/domain/entities';

export class DeleteGroupLinkHandlerFixture {
  static readonly validUserId = 7;

  static readonly validGroupLinkId = 1;

  static readonly nonExistentGroupLinkId = 999;

  static get existingGroupLink(): GroupLink {
    return Object.assign(new GroupLink(), {
      id: DeleteGroupLinkHandlerFixture.validGroupLinkId,
      userId: DeleteGroupLinkHandlerFixture.validUserId,
      title: 'Group to Delete',
      description: 'This group will be deleted',
      color: { r: 255, g: 0, b: 0 },
      icon: 'trash',
      parentGroupLinkId: null,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    });
  }
}
