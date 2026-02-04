import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOneOptions, type FindOptionsOrder, type FindOptionsWhere, Repository } from 'typeorm';

import { type ILinkRepository } from '@apps/links/src/domain/ports/link-repository.port';
import { Link } from '@apps/links/src/domain/entities/link.entity';

@Injectable()
export class TypeOrmLinkRepository implements ILinkRepository {
  constructor(
    @InjectRepository(Link)
    private readonly repository: Repository<Link>,
  ) {}

  async findOne(options: FindOneOptions<Link>): Promise<Link | null> {
    return this.repository.findOne(options);
  }

  async findAndCount(options: { skip: number; take: number; order?: FindOptionsOrder<Link>; where?: FindOptionsWhere<Link>; relations?: string[] }): Promise<[Link[], number]> {
    return this.repository.findAndCount(options);
  }

  async find(options: { select?: (keyof Link)[]; where: FindOptionsWhere<Link> }): Promise<Link[]> {
    return this.repository.find(options);
  }

  async save(link: Link): Promise<Link> {
    return this.repository.save(link);
  }

  async update(criteria: FindOptionsWhere<Link>, data: Partial<Link>): Promise<{ affected?: number }> {
    return this.repository.update(criteria, data);
  }

  async softDelete(criteria: FindOptionsWhere<Link>): Promise<{ affected?: number }> {
    return this.repository.softDelete(criteria);
  }
}
