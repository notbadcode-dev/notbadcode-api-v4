import { type CreateGroupLinkRequest } from '@apps/links/src/application/requests';

export class CreateGroupLinkCommand {
  constructor(
    public readonly payload: CreateGroupLinkRequest,
    public readonly userId: number,
  ) {}
}
