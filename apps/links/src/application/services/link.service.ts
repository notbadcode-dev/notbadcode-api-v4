import { Injectable } from '@nestjs/common';

import { UpdateLinkRequest } from '@apps/links/src/application/requests/update-link.request';
import { Link } from '@apps/links/src/domain/entities/link.entity';

@Injectable()
export class LinkService {
  updateLink(link: Link, payload: Partial<UpdateLinkRequest>): Link {
    if (payload.url !== undefined) {
      link.url = payload.url;
      link.normalizedUrl = payload.url.toLowerCase();
    }

    if (payload.title !== undefined) {
      link.title = payload.title;
    }

    if (payload.description !== undefined) {
      link.description = payload.description;
    }

    if (payload.isFavorite !== undefined) {
      link.isFavorite = payload.isFavorite;
    }

    if (payload.tagList !== undefined) {
      link.tagList = payload.tagList;
    }

    if (payload.groupLinkId !== undefined) {
      link.groupLinkId = payload.groupLinkId;
    }

    return link;
  }
}
