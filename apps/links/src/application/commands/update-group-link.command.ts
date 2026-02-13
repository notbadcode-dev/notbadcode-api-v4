import { type UpdateGroupLinkRequest } from '@apps/links/src/application/requests';

export class UpdateGroupLinkCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateGroupLinkRequest,
    public readonly userId: number,
  ) {}
}
