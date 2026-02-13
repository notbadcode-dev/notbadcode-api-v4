import { type FindOneOptions, type FindOptionsOrder, type FindOptionsWhere } from 'typeorm';

import { type GroupLink } from '@apps/links/src/domain/entities';

export interface IGroupLinkRepository {
  findOne(options: FindOneOptions<GroupLink>): Promise<GroupLink | null>;
  findAndCount(options: { skip: number; take: number; order?: FindOptionsOrder<GroupLink>; where?: FindOptionsWhere<GroupLink>; relations?: string[] }): Promise<[GroupLink[], number]>;
  find(options: { select?: (keyof GroupLink)[]; where: FindOptionsWhere<GroupLink> }): Promise<GroupLink[]>;
  save(groupLink: GroupLink): Promise<GroupLink>;
  update(criteria: FindOptionsWhere<GroupLink>, data: Partial<GroupLink>): Promise<{ affected?: number }>;
  softDelete(criteria: Pick<GroupLink, 'id' | 'userId'>): Promise<{ affected?: number }>;
}
