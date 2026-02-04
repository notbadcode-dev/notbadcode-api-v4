import { type FindOneOptions, type FindOptionsOrder, type FindOptionsWhere } from 'typeorm';

import { type Link } from '@apps/links/src/domain/entities/link.entity';

export interface ILinkRepository {
  findOne(options: FindOneOptions<Link>): Promise<Link | null>;
  findAndCount(options: { skip: number; take: number; order?: FindOptionsOrder<Link>; where?: FindOptionsWhere<Link>; relations?: string[] }): Promise<[Link[], number]>;
  find(options: { select?: (keyof Link)[]; where: FindOptionsWhere<Link> }): Promise<Link[]>;
  save(link: Link): Promise<Link>;
  update(criteria: FindOptionsWhere<Link>, data: Partial<Link>): Promise<{ affected?: number }>;
  softDelete(criteria: FindOptionsWhere<Link>): Promise<{ affected?: number }>;
}
