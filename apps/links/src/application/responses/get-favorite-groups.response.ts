import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { GetGroupLinkByIdResponse } from './get-group-link-by-id.response';

@Exclude()
export class GetFavoriteGroupsResponse {
  @ApiProperty({ type: [GetGroupLinkByIdResponse] })
  @Expose()
  @Type(() => GetGroupLinkByIdResponse)
  groupLinkList!: GetGroupLinkByIdResponse[];

  constructor(partial?: Partial<GetFavoriteGroupsResponse>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
