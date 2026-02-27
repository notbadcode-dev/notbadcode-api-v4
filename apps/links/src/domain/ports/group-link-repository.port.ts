import type { GroupLink } from '@apps/links/src/domain/entities';
import type { IBaseRepository } from '@apps/links/src/domain/ports/base-repository.port';

export interface IGroupLinkRepository extends IBaseRepository<GroupLink> {
  softDelete(criteria: Pick<GroupLink, 'id' | 'userId'>): Promise<{ affected?: number }>;
}
