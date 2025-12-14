import { type GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';
import { LinkLastStatusCode } from '@apps/links/src/domain/enums/link-last-status-code.enum';

export class GetLinkByIdResponseFixture {
  static partialResponse(): Partial<GetLinkByIdResponse> {
    return {
      id: 100,
      url: 'https://example.com/resource',
      normalizedUrl: 'https://example.com/resource',
      title: 'Example resource',
      description: 'Sample description',
      faviconUrl: 'https://example.com/favicon.ico',
      imagePreviewUrl: 'https://example.com/preview.png',
      isFavorite: true,
      tagList: ['example', 'resource'],
      isActive: true,
      lastStatusCode: LinkLastStatusCode.OK,
      lastCheckedAt: new Date('2024-01-01T10:00:00.000Z'),
      lastVisitedAt: new Date('2024-01-02T10:00:00.000Z'),
    };
  }
}
