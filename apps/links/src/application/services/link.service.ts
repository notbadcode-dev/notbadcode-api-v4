import { Injectable } from '@nestjs/common';

import { UpdateLinkRequest } from '@apps/links/src/application/requests/update-link.request';
import { Link } from '@apps/links/src/domain/entities/link.entity';

@Injectable()
export class LinkService {
  updateLink(link: Link, payload: UpdateLinkRequest): Link {
    link.url = payload.url.trim();
    link.normalizedUrl = payload.url.trim().toLowerCase();
    link.title = payload.title.trim();
    link.description = payload.description.trim();
    link.isFavorite = payload.isFavorite;
    link.tagList = payload.tagList.map((tag) => tag.trim());
    return link;
  }
}
