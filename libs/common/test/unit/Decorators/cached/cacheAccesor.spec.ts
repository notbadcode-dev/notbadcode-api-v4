import { CacheAccessor } from '@common/redis/cache/cacheAccessor';

import type { Cache } from 'cache-manager';

describe('CacheAccessor (unit)', () => {
  const fakeCache = { get: jest.fn(), set: jest.fn() } as unknown as Cache;

  afterEach(() => {
    // Reset static cache for each test
    CacheAccessor.setCache(null as unknown as Cache);
  });

  it('sets cache on module init if not already initialized', () => {
    const accessor = new CacheAccessor(fakeCache);
    accessor.onModuleInit();
    expect(CacheAccessor.cache).toBe(fakeCache);
  });

  it('does not overwrite cache if already initialized', () => {
    const firstCache = { get: jest.fn() } as unknown as Cache;
    CacheAccessor.setCache(firstCache);

    const anotherCache = { get: jest.fn() } as unknown as Cache;
    const accessor = new CacheAccessor(anotherCache);
    accessor.onModuleInit();

    expect(CacheAccessor.cache).toBe(firstCache); // Should not be overwritten
  });

  it('static getter cache returns null if not initialized', () => {
    CacheAccessor.setCache(null as unknown as Cache);
    expect(CacheAccessor.cache).toBeNull();
  });

  it('isInitialized should return true if cache is set', () => {
    CacheAccessor.setCache(fakeCache);
    expect(CacheAccessor.isInitialized).toBe(true);
  });

  it('isInitialized should return false if cache is null', () => {
    CacheAccessor.setCache(null as unknown as Cache);
    expect(CacheAccessor.isInitialized).toBe(false);
  });

  it('setCache should update the cache reference', () => {
    CacheAccessor.setCache(fakeCache);
    expect(CacheAccessor.cache).toBe(fakeCache);
  });
});
