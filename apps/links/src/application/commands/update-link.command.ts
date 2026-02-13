import { type UpdateLinkRequest } from '@apps/links/src/application/requests';

export class UpdateLinkCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateLinkRequest,
    public readonly userId: number,
  ) {}
}
