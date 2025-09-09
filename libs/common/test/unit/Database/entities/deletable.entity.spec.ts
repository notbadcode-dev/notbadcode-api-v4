import { DeletableEntity } from '@common/database';

class TestDeletable extends DeletableEntity {}

describe('DeletableEntity', () => {
  it('allows setting deletedAt', () => {
    const entity = new TestDeletable();
    const now = new Date();
    entity.deletedAt = now;
    expect(entity.deletedAt).toBe(now);
  });
});
