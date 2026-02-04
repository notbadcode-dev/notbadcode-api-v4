export class DeleteLinkCommand {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}
