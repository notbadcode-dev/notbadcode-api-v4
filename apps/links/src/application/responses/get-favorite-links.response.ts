import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { GetLinkByIdResponse } from './get-link-by-id.response';

@Exclude()
export class GetFavoriteLinksResponse {
  @ApiProperty({ type: [GetLinkByIdResponse] })
  @Expose()
  @Type(() => GetLinkByIdResponse)
  linkList!: GetLinkByIdResponse[];

  constructor(partial?: Partial<GetFavoriteLinksResponse>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
