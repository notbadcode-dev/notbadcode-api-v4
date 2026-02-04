import { type FindOneOptions } from 'typeorm';

import { type GroupLink } from '../entities/group-link.entity';

export class GroupLinkByIdSpecification {
  static options(id: number, userId: number): FindOneOptions<GroupLink> {
    return {
      where: { id, userId },
      relations: ['links'],
    };
  }
}
