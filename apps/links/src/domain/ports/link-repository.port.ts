import type { Link } from '@apps/links/src/domain/entities';
import type { IBaseRepository } from '@apps/links/src/domain/ports/base-repository.port';

export interface ILinkRepository extends IBaseRepository<Link> {
  softDelete(criteria: Pick<Link, 'id' | 'userId'>): Promise<{ affected?: number }>;
}
