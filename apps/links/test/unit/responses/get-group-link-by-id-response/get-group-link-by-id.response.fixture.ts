import { type GetGroupLinkByIdResponse } from '@apps/links/src/application/responses/get-group-link-by-id.response';
import { LinkBasicResponse } from '@apps/links/src/application/responses/link-basic.response';
import { LinkLastStatusCode } from '@apps/links/src/domain/enums/link-last-status-code.enum';

export class GetGroupLinkByIdResponseFixture {
  static partialResponse(): Partial<GetGroupLinkByIdResponse> {
    return {
      id: 1,
      title: 'Development',
      description: 'Development related links',
      color: { r: 59, g: 130, b: 246 },
      icon: 'code',
      parentGroupLinkId: null,
      isFavorite: false,
      links: [],
    };
  }

  static partialResponseWithLinks(): Partial<GetGroupLinkByIdResponse> {
    return {
      ...GetGroupLinkByIdResponseFixture.partialResponse(),
      links: [
        new LinkBasicResponse({
          id: 10,
          url: 'https://figma.com',
          title: 'Figma',
          faviconUrl: 'https://figma.com/favicon.ico',
          isFavorite: false,
          isActive: true,
          lastStatusCode: LinkLastStatusCode.OK,
        }),
        new LinkBasicResponse({
          id: 11,
          url: 'https://dribbble.com',
          title: 'Dribbble',
          faviconUrl: null,
          isFavorite: true,
          isActive: true,
          lastStatusCode: LinkLastStatusCode.OK,
        }),
      ],
    };
  }

  static partialResponseWithParent(): Partial<GetGroupLinkByIdResponse> {
    return {
      ...GetGroupLinkByIdResponseFixture.partialResponse(),
      id: 6,
      title: 'Frontend Frameworks',
      parentGroupLinkId: 1,
    };
  }
}
