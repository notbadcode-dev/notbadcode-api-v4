import { ApiProperty } from '@nestjs/swagger';

export class GetLinkByIdRequest {
  @ApiProperty()
  id!: number;

  constructor(id: number) {
    this.id = id;
  }
}
