import { PaginatedRequest } from '@common/requests';

import { type Link } from '@apps/links/src/domain/entities';

export class GetLinksPaginatedHandlerFixture {
  static readonly validUserId = 123;
  static readonly totalCount = 3;
  static readonly emptyList: Link[] = [];

  static readonly linkList: Link[] = [
    {
      id: 1,
      userId: GetLinksPaginatedHandlerFixture.validUserId,
      url: 'https://example.com',
      normalizedUrl: 'https://example.com',
      title: 'Example',
      description: 'Example description',
      isFavorite: true,
      tagList: ['tag1'],
      groupLinkId: null,
      groupLink: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
    } as Link,
    {
      id: 2,
      userId: GetLinksPaginatedHandlerFixture.validUserId,
      url: 'https://github.com',
      normalizedUrl: 'https://github.com',
      title: 'GitHub',
      description: null,
      isFavorite: false,
      tagList: [],
      groupLinkId: 1,
      groupLink: { id: 1, title: 'Dev Tools' } as any,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      deletedAt: null,
    } as Link,
    {
      id: 3,
      userId: GetLinksPaginatedHandlerFixture.validUserId,
      url: 'https://stackoverflow.com',
      normalizedUrl: 'https://stackoverflow.com',
      title: 'Stack Overflow',
      description: 'Q&A site',
      isFavorite: true,
      tagList: ['dev', 'help'],
      groupLinkId: null,
      groupLink: null,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      deletedAt: null,
    } as Link,
  ];

  static createRequest(overrides: Partial<PaginatedRequest> = {}): PaginatedRequest {
    const request = new PaginatedRequest();
    request.currentPage = overrides.currentPage ?? 1;
    request.take = overrides.take ?? 10;
    request.skip = overrides.skip;
    request.sortBy = overrides.sortBy;
    request.sortOrder = overrides.sortOrder ?? 'ASC';
    return request;
  }
}
