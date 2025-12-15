import { CacheAccessor } from '@common/redis/cache/cache-accessor';

import type { Cache } from 'cache-manager';

describe('CacheAccessor (unit)', () => {
  const fakeCache = { get: jest.fn(), set: jest.fn() } as unknown as Cache;

  afterEach(() => {
    // Reset static cache for each test
    CacheAccessor.setCache(null as unknown as Cache);
  });

  it('sets cache on module init if not already initialized', () => {
    // Arrange
    const accessor = new CacheAccessor(fakeCache);

    // Act
    accessor.onModuleInit();

    // Assert
    expect(CacheAccessor.cache).toBe(fakeCache);
  });

  it('does not overwrite cache if already initialized', () => {
    // Arrange
    const firstCache = { get: jest.fn() } as unknown as Cache;
    CacheAccessor.setCache(firstCache);
    const anotherCache = { get: jest.fn() } as unknown as Cache;
    const accessor = new CacheAccessor(anotherCache);

    // Act
    accessor.onModuleInit();

    // Assert
    expect(CacheAccessor.cache).toBe(firstCache); // Should not be overwritten
  });

  it('static getter cache returns null if not initialized', () => {
    // Arrange
    CacheAccessor.setCache(null as unknown as Cache);

    // Act
    const result = CacheAccessor.cache;

    // Assert
    expect(result).toBeNull();
  });

  it('isInitialized should return true if cache is set', () => {
    // Arrange
    CacheAccessor.setCache(fakeCache);

    // Act
    const result = CacheAccessor.isInitialized;

    // Assert
    expect(result).toBe(true);
  });

  it('isInitialized should return false if cache is null', () => {
    // Arrange
    CacheAccessor.setCache(null as unknown as Cache);

    // Act
    const result = CacheAccessor.isInitialized;

    // Assert
    expect(result).toBe(false);
  });

  it('setCache should update the cache reference', () => {
    // Arrange
    const expected = fakeCache;

    // Act
    CacheAccessor.setCache(expected);

    // Assert
    expect(CacheAccessor.cache).toBe(expected);
  });
});
