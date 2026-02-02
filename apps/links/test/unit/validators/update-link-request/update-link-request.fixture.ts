import { UpdateLinkRequest } from '@apps/links/src/application/requests/update-link.request';

export class UpdateLinkRequestValidatorFixture {
  static getValidFullRequest(): UpdateLinkRequest {
    return Object.assign(new UpdateLinkRequest(), {
      url: 'https://example.com',
      title: 'My Link',
      description: 'A description',
      isFavorite: false,
      tagList: ['tag1', 'tag2'],
    });
  }

  static getValidEmptyRequest(): UpdateLinkRequest {
    return new UpdateLinkRequest();
  }

  static getInvalidUrlRequest(): UpdateLinkRequest {
    return Object.assign(new UpdateLinkRequest(), {
      url: 'not-a-url',
    });
  }

  static getTooLongUrlRequest(): UpdateLinkRequest {
    return Object.assign(new UpdateLinkRequest(), {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      url: `https://example.com/${'a'.repeat(2000)}`,
    });
  }

  static getEmptyTitleRequest(): UpdateLinkRequest {
    return Object.assign(new UpdateLinkRequest(), {
      title: '',
    });
  }

  static getTooLongTitleRequest(): UpdateLinkRequest {
    return Object.assign(new UpdateLinkRequest(), {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      title: 'a'.repeat(251),
    });
  }

  static getTooLongDescriptionRequest(): UpdateLinkRequest {
    return Object.assign(new UpdateLinkRequest(), {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      description: 'a'.repeat(501),
    });
  }

  static getInvalidFavoriteRequest(): UpdateLinkRequest {
    return Object.assign(new UpdateLinkRequest(), {
      isFavorite: 'not-a-boolean',
    });
  }

  static getNonArrayTagListRequest(): UpdateLinkRequest {
    return Object.assign(new UpdateLinkRequest(), {
      tagList: 'not-an-array',
    });
  }

  static getTooManyTagsRequest(): UpdateLinkRequest {
    return Object.assign(new UpdateLinkRequest(), {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      tagList: Array.from({ length: 51 }, (_, i) => `tag${i}`),
    });
  }

  static getTagListWithNonStringRequest(): UpdateLinkRequest {
    return Object.assign(new UpdateLinkRequest(), {
      tagList: [123, 456],
    });
  }

  static getTagListWithTooLongTagRequest(): UpdateLinkRequest {
    return Object.assign(new UpdateLinkRequest(), {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      tagList: ['a'.repeat(251)],
    });
  }
}
