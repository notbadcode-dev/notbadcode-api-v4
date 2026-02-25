import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOneOptions, type FindOptionsOrder, type FindOptionsWhere, Repository } from 'typeorm';

import { GroupLink } from '@apps/links/src/domain/entities';
import { type IGroupLinkRepository } from '@apps/links/src/domain/ports';

@Injectable()
export class TypeOrmGroupLinkRepository implements IGroupLinkRepository {
  constructor(
    @InjectRepository(GroupLink)
    private readonly repository: Repository<GroupLink>,
  ) {}

  async findOne(options: FindOneOptions<GroupLink>): Promise<GroupLink | null> {
    return this.repository.findOne(options);
  }

  async findAndCount(options: { skip: number; take: number; order?: FindOptionsOrder<GroupLink>; where?: FindOptionsWhere<GroupLink>; relations?: string[] }): Promise<[GroupLink[], number]> {
    return this.repository.findAndCount(options);
  }

  async find(options: { select?: (keyof GroupLink)[]; where: FindOptionsWhere<GroupLink> }): Promise<GroupLink[]> {
    return this.repository.find(options);
  }

  async save(groupLink: GroupLink): Promise<GroupLink> {
    return this.repository.save(groupLink);
  }

  async update(criteria: FindOptionsWhere<GroupLink>, data: Partial<GroupLink>): Promise<{ affected?: number }> {
    return this.repository.update(criteria, data);
  }

  async softDelete(criteria: Pick<GroupLink, 'id' | 'userId'>): Promise<{ affected?: number }> {
    return this.repository.softDelete(criteria);
  }
}
