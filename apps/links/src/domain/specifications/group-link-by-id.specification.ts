import { type FindOneOptions } from 'typeorm';

import { type GroupLink } from '@apps/links/src/domain/entities';

export class GroupLinkByIdSpecification {
  static options(id: number, userId: number): FindOneOptions<GroupLink> {
    return {
      where: { id, userId },
      relations: ['links'],
    };
  }
}
