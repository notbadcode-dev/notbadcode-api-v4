/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GroupLink, Link } from '@apps/links/src/domain/entities';
import { LinkLastStatusCode } from '@apps/links/src/domain/enums';

export class GroupLinkByIdHandlerFixture {
  static readonly validGroupLink: GroupLink = Object.assign(new GroupLink(), {
    id: 1,
    userId: 1,
    title: 'Development',
    description: 'Development related links',
    color: { r: 59, g: 130, b: 246 },
    icon: 'code',
    parentGroupLinkId: null,
    isFavorite: false,
    links: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  });

  static readonly validGroupLinkWithLinks: GroupLink = Object.assign(new GroupLink(), {
    id: 2,
    userId: 1,
    title: 'Design',
    description: 'Design resources',
    color: { r: 236, g: 72, b: 153 },
    icon: 'palette',
    parentGroupLinkId: null,
    isFavorite: true,
    links: [
      Object.assign(new Link(), {
        id: 10,
        url: 'https://figma.com',
        title: 'Figma',
        faviconUrl: 'https://figma.com/favicon.ico',
        isFavorite: false,
        isActive: true,
        lastStatusCode: LinkLastStatusCode.OK,
        userId: 1,
        groupLinkId: 2,
      }),
      Object.assign(new Link(), {
        id: 11,
        url: 'https://dribbble.com',
        title: 'Dribbble',
        faviconUrl: null,
        isFavorite: true,
        isActive: true,
        lastStatusCode: LinkLastStatusCode.OK,
        userId: 1,
        groupLinkId: 2,
      }),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  });

  static readonly notFoundId = 999;

  static readonly validUserId = 1;
}
