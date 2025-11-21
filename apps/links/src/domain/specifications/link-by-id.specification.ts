import { type FindOneOptions } from 'typeorm';

import { type Link } from '../entities/link.entity';

export class LinkByIdSpecification {
  static options(id: number): FindOneOptions<Link> {
    return {
      where: { id },
    };
  }
}
