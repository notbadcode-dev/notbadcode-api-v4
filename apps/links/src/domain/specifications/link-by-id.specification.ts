import { type FindOneOptions } from 'typeorm';

import { type Link } from '@apps/links/src/domain/entities';

export class LinkByIdSpecification {
  static options(id: number, userId: number): FindOneOptions<Link> {
    return {
      where: { id, userId },
      relations: ['groupLink'],
    };
  }
}
