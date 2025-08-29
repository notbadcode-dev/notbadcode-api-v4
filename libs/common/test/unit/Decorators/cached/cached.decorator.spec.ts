/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

jest.mock('@common/responses', () => {
  const actual = jest.requireActual('@common/responses');
  const apiResponseFailure = jest.fn((_i18n: unknown, msgs: ApiResponseMessage[]) => ({
    success: false,
    messageList: msgs.map((msg: ApiResponseMessage) => ({ type: msg.type, message: msg.message })),
    code: undefined,
  }));
  return { ...actual, apiResponseFailure } as ApiFailureResponse;
});

import { CommonConstants, CommonErrorMessageConstants } from '@common/constants';
import { RedisCacheConstants } from '@common/constants/redisCache.constants';
import { CacheAccessor } from '@common/redis/cache/cacheAccessor';
import {
  Cached,
  getClassName,
  makeCacheKey,
  returnCacheError,
  stableReplacer,
} from '@common/redis/cache/decorators/cached.decorator';
import { ApiFailureResponse, apiResponseFailure, ApiResponseMessage } from '@common/responses';
import { EApiResponseMessageType } from '@common/responses/apiResponseMessageType';

import { CachedDecoratorFixture } from './cached.decorator.fixture';

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (CacheAccessor as any)._cache = null;
  (apiResponseFailure as jest.Mock).mockClear();
});

describe('cached.decorator util functions', () => {
  it('redacts keys containing password in stableReplacer', () => {
    const obj = { username: 'user', Password123: 'secret', data: 42 };
    const result = stableReplacer('root', obj) as Record<string, unknown>;
    expect(result.Password123).toBe(CommonConstants.redactedTag);
    expect(result.username).toBe('user');
  });

  it('returns unchanged value for non-object in stableReplacer', () => {
    expect(stableReplacer('root', CachedDecoratorFixture.exampleArg)).toBe(CachedDecoratorFixture.exampleArg);
    expect(stableReplacer('root', null)).toBe(null);
    expect(stableReplacer('root', [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('returns cache key without args when args.length === 0', () => {
    const key = makeCacheKey('Class', CachedDecoratorFixture.exampleKey, []);
    expect(key).toBe(`Class:${CachedDecoratorFixture.exampleKey}`);
  });

  it('returns cache key with args when args present', () => {
    const key = makeCacheKey('Class', CachedDecoratorFixture.exampleKey, [
      CachedDecoratorFixture.exampleArg,
      CachedDecoratorFixture.stringArg,
    ]);
    expect(key).toContain(`Class:${CachedDecoratorFixture.exampleKey}`);
    expect(key).toContain(String(CachedDecoratorFixture.exampleArg));
    expect(key).toContain(CachedDecoratorFixture.stringArg);
  });

  it('returns class name if available in getClassName', () => {
    class TestClass {}
    const instance = new TestClass();
    expect(getClassName(instance)).toBe('TestClass');
  });

  it('returns unknownClassName if no constructor in getClassName', () => {
    const plainObj = Object.create(null); // No constructor
    expect(getClassName(plainObj)).toBe(RedisCacheConstants.unknownClassName);
  });

  it('returns error response with i18nService in returnCacheError', async () => {
    const i18nMock = { translate: jest.fn(async () => 'msg') };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await returnCacheError(i18nMock as any);
    expect((res as ApiFailureResponse).success).toBe(false);
  });

  it('returns null if no i18nService in returnCacheError', async () => {
    const res = await returnCacheError();
    expect(res).toBeNull();
  });
});

// ===== Decorator tests =====
describe('Cached Decorator', () => {
  it('returns an i18n error if cache is missing and I18nService is provided', async () => {
    class I18nServiceMock {
      translate = jest.fn(async (key: string) => `[en] ${key}`);
    }
    const i18n = new I18nServiceMock();

    class Svc {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      @Cached(CachedDecoratorFixture.CachedTimer, i18n as any)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async demo(_x: number): Promise<any> {
        throw new Error(CachedDecoratorFixture.noCachedError);
      }
    }
    const svc = new Svc();
    const res = (await svc.demo(CachedDecoratorFixture.exampleArg)) as ApiFailureResponse;

    expect(apiResponseFailure).toHaveBeenCalled();
    expect(i18n.translate).toHaveBeenCalledWith(CommonErrorMessageConstants.redisCacheNotInitialized);
    expect(res.success).toBe(false);
    expect(res.messageList?.[0]?.type).toBe(EApiResponseMessageType.Error);
    expect(res.messageList?.[0]?.message).toContain('redisCacheNotInitialized');
  });

  it('returns null if cache is missing and I18nService is not provided', async () => {
    const { Cached } = await import('@common/redis/cache/decorators/cached.decorator');

    class Svc {
      @Cached(CachedDecoratorFixture.CachedTimer)
      async foo(): Promise<any> {
        throw new Error(CachedDecoratorFixture.noCachedError);
      }
    }
    const svc = new Svc();
    expect(await svc.foo()).toBeNull();
  });

  it('uses the cache if it is initialized', async () => {
    const fakeCache = {
      get: jest.fn().mockResolvedValue('cached-value'),
      set: jest.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (CacheAccessor as any)._cache = fakeCache;

    class Svc {
      @Cached(CachedDecoratorFixture.CachedTimer)
      async foo(x: number) {
        return `${CachedDecoratorFixture.computedPrefix}${x}`;
      }
    }
    const svc = new Svc();
    const res = await svc.foo(CachedDecoratorFixture.exampleArg);

    expect(res).toBe('cached-value');
    expect(fakeCache.get).toHaveBeenCalled();
  });

  it('computes and stores value in cache if it does not exist', async () => {
    const fakeCache = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (CacheAccessor as any)._cache = fakeCache;

    class Svc {
      @Cached(CachedDecoratorFixture.CachedTimer)
      async foo(x: number) {
        return `${CachedDecoratorFixture.calcPrefix}${x}`;
      }
    }
    const svc = new Svc();
    const res = await svc.foo(CachedDecoratorFixture.exampleArg);

    expect(res).toBe(`${CachedDecoratorFixture.calcPrefix}${CachedDecoratorFixture.exampleArg}`);
    expect(fakeCache.set).toHaveBeenCalledWith(
      expect.any(String),
      `${CachedDecoratorFixture.calcPrefix}${CachedDecoratorFixture.exampleArg}`,
      CachedDecoratorFixture.CachedTimer * 1000,
    );
  });

  it('handles propertyKey as symbol in Cached', async () => {
    const fakeCache = { get: jest.fn().mockResolvedValue(undefined), set: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (CacheAccessor as any)._cache = fakeCache;
    class Svc {
      @Cached(CachedDecoratorFixture.CachedTimer)
      async [CachedDecoratorFixture.symbolKey]() {
        return CachedDecoratorFixture.testReturn;
      }
    }
    const svc = new Svc();
    const res = await svc[CachedDecoratorFixture.symbolKey]();
    expect(res).toBe(CachedDecoratorFixture.testReturn);
  });

  it('returns descriptor if original method is undefined', () => {
    const desc: any = { value: undefined };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = Cached(CachedDecoratorFixture.CachedTimer)({}, CachedDecoratorFixture.exampleKey, desc);
    expect(result).toBe(desc);
  });
});
