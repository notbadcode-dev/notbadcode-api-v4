import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GetTotalsResponse {
  @ApiProperty({ example: 10 })
  @Expose()
  totalLinks!: number;

  @ApiProperty({ example: 5 })
  @Expose()
  totalGroups!: number;

  constructor(partial?: Partial<GetTotalsResponse>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
