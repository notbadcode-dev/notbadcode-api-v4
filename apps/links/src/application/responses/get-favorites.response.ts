import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { GetGroupLinkByIdResponse } from './get-group-link-by-id.response';
import { GetLinkByIdResponse } from './get-link-by-id.response';

@Exclude()
export class GetFavoritesResponse {
  @ApiProperty({ type: [GetLinkByIdResponse] })
  @Expose()
  @Type(() => GetLinkByIdResponse)
  linkList!: GetLinkByIdResponse[];

  @ApiProperty({ type: [GetGroupLinkByIdResponse] })
  @Expose()
  @Type(() => GetGroupLinkByIdResponse)
  groupLinkList!: GetGroupLinkByIdResponse[];

  constructor(partial?: Partial<GetFavoritesResponse>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
