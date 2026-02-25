 
import { type PaginatedRequest } from '@common/requests';

import { GroupLink } from '@apps/links/src/domain/entities';

export class GetGroupLinksPaginatedHandlerFixture {
  static readonly validUserId = 7;

  static createRequest(overrides?: Partial<PaginatedRequest>): PaginatedRequest {
    return {
      skip: 0,
      take: 10,
      currentPage: 1,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      ...overrides,
    } as PaginatedRequest;
  }

  static get groupLinkList(): GroupLink[] {
    return [
      Object.assign(new GroupLink(), {
        id: 1,
        userId: GetGroupLinksPaginatedHandlerFixture.validUserId,
        title: 'First Group',
        description: 'First group description',
        color: { r: 255, g: 0, b: 0 },
        icon: 'folder',
        parentGroupLinkId: null,
        isFavorite: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: undefined,
      }),
      Object.assign(new GroupLink(), {
        id: 2,
        userId: GetGroupLinksPaginatedHandlerFixture.validUserId,
        title: 'Second Group',
        description: 'Second group description',
        color: { r: 0, g: 255, b: 0 },
        icon: 'star',
        parentGroupLinkId: null,
        isFavorite: false,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: undefined,
      }),
      Object.assign(new GroupLink(), {
        id: 3,
        userId: GetGroupLinksPaginatedHandlerFixture.validUserId,
        title: 'Third Group',
        description: null,
        color: null,
        icon: null,
        parentGroupLinkId: 1,
        isFavorite: false,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        deletedAt: undefined,
      }),
    ];
  }

  static readonly emptyList: GroupLink[] = [];

  static readonly totalCount = 3;
}
