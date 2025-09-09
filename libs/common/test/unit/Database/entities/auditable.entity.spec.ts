import { AuditableEntity } from '@common/database';

class TestAuditable extends AuditableEntity {}

describe('AuditableEntity', () => {
  it('allows setting audit fields', () => {
    const entity = new TestAuditable();
    const now = new Date();
    entity.createdAt = now;
    entity.updatedAt = now;
    expect(entity.createdAt).toBe(now);
    expect(entity.updatedAt).toBe(now);
  });
});
