export class GetLinkByIdQuery {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}
