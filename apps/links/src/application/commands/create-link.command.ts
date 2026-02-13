import { type CreateLinkRequest } from '@apps/links/src/application/requests';

export class CreateLinkCommand {
  constructor(
    public readonly payload: CreateLinkRequest,
    public readonly userId: number,
  ) {}
}
