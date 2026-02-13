import { CreateLinkRequest } from '@apps/links/src/application/requests';

export class CreateLinkRequestValidatorFixture {
  static getValidFullRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      url: 'https://example.com',
      title: 'My Link',
      description: 'A description',
      isFavorite: false,
      tagList: ['tag1', 'tag2'],
      groupLinkId: 1,
    });
  }

  static getValidMinimalRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      url: 'https://example.com',
    });
  }

  static getMissingUrlRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      title: 'No URL',
    });
  }

  static getInvalidUrlRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      url: 'not-a-url',
    });
  }

  static getTooLongUrlRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      url: `https://example.com/${'a'.repeat(2000)}`,
    });
  }

  static getEmptyTitleRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      url: 'https://example.com',
      title: '',
    });
  }

  static getTooLongTitleRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      url: 'https://example.com',
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      title: 'a'.repeat(251),
    });
  }

  static getTooLongDescriptionRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      url: 'https://example.com',
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      description: 'a'.repeat(501),
    });
  }

  static getInvalidFavoriteRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      url: 'https://example.com',
      isFavorite: 'not-a-boolean',
    });
  }

  static getNonArrayTagListRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      url: 'https://example.com',
      tagList: 'not-an-array',
    });
  }

  static getTooManyTagsRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      url: 'https://example.com',
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      tagList: Array.from({ length: 51 }, (_, i) => `tag${i}`),
    });
  }

  static getTagListWithNonStringRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      url: 'https://example.com',
      tagList: [123, 456],
    });
  }

  static getTagListWithTooLongTagRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      url: 'https://example.com',
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      tagList: ['a'.repeat(251)],
    });
  }

  static getInvalidGroupLinkIdRequest(): CreateLinkRequest {
    return Object.assign(new CreateLinkRequest(), {
      url: 'https://example.com',
      groupLinkId: 0,
    });
  }
}
