import { type UpdateLinkRequest } from '@apps/links/src/application/requests/update-link.request';

export class UpdateLinkCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateLinkRequest,
  ) {}
}
