export class DeleteGroupLinkCommand {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}
