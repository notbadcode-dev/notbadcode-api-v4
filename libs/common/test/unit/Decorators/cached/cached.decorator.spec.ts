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
import {
  ApiFailureResponse,
  apiResponseFailure,
  ApiResponseMessage,
  EApiResponseMessageType,
} from '@common/responses';

import { CachedDecoratorFixture } from './cached.decorator.fixture';

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (CacheAccessor as any)._cache = null;
  (apiResponseFailure as jest.Mock).mockClear();
});

  describe('cached.decorator util functions', () => {
    it('redacts keys containing password in stableReplacer', () => {
      // Arrange
      const obj = { username: 'user', Password123: 'secret', data: 42 };

      // Act
      const result = stableReplacer('root', obj) as Record<string, unknown>;

      // Assert
      expect(result.Password123).toBe(CommonConstants.redactedTag);
      expect(result.username).toBe('user');
    });

    it('returns unchanged value for non-object in stableReplacer', () => {
      // Arrange
      const numValue = CachedDecoratorFixture.exampleArg;
      const nullValue = null;
      const arrayValue = [1, 2, 3];

      // Act & Assert
      expect(stableReplacer('root', numValue)).toBe(numValue);
      expect(stableReplacer('root', nullValue)).toBe(nullValue);
      expect(stableReplacer('root', arrayValue)).toEqual(arrayValue);
    });

    it('returns cache key without args when args.length === 0', () => {
      // Arrange
      const args: unknown[] = [];

      // Act
      const key = makeCacheKey('Class', CachedDecoratorFixture.exampleKey, args);

      // Assert
      expect(key).toBe(`Class:${CachedDecoratorFixture.exampleKey}`);
    });

    it('returns cache key with args when args present', () => {
      // Arrange
      const args = [
        CachedDecoratorFixture.exampleArg,
        CachedDecoratorFixture.stringArg,
      ];

      // Act
      const key = makeCacheKey('Class', CachedDecoratorFixture.exampleKey, args);

      // Assert
      expect(key).toContain(`Class:${CachedDecoratorFixture.exampleKey}`);
      expect(key).toContain(String(CachedDecoratorFixture.exampleArg));
      expect(key).toContain(CachedDecoratorFixture.stringArg);
    });

    it('returns class name if available in getClassName', () => {
      // Arrange
      class TestClass {}
      const instance = new TestClass();

      // Act
      const name = getClassName(instance);

      // Assert
      expect(name).toBe('TestClass');
    });

    it('returns unknownClassName if no constructor in getClassName', () => {
      // Arrange
      const plainObj = Object.create(null); // No constructor

      // Act
      const name = getClassName(plainObj);

      // Assert
      expect(name).toBe(RedisCacheConstants.unknownClassName);
    });

    it('returns error response with i18nService in returnCacheError', async () => {
      // Arrange
      const i18nMock = { translate: jest.fn(async () => 'msg') };

      // Act
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const res = await returnCacheError(i18nMock as any);

      // Assert
      expect((res as ApiFailureResponse).success).toBe(false);
    });

    it('returns null if no i18nService in returnCacheError', async () => {
      // Act
      const res = await returnCacheError();

      // Assert
      expect(res).toBeNull();
    });
  });

// ===== Decorator tests =====
  describe('Cached Decorator', () => {
    it('returns an i18n error if cache is missing and I18nService is provided', async () => {
      // Arrange
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

      // Act
      const res = (await svc.demo(CachedDecoratorFixture.exampleArg)) as ApiFailureResponse;

      // Assert
      expect(apiResponseFailure).toHaveBeenCalled();
      expect(i18n.translate).toHaveBeenCalledWith(CommonErrorMessageConstants.redisCacheNotInitialized);
      expect(res.success).toBe(false);
      expect(res.messageList?.[0]?.type).toBe(EApiResponseMessageType.Error);
      expect(res.messageList?.[0]?.message).toContain('redisCacheNotInitialized');
    });

    it('returns null if cache is missing and I18nService is not provided', async () => {
      // Arrange
      const { Cached } = await import('@common/redis/cache/decorators/cached.decorator');

      class Svc {
        @Cached(CachedDecoratorFixture.CachedTimer)
        async foo(): Promise<any> {
          throw new Error(CachedDecoratorFixture.noCachedError);
        }
      }
      const svc = new Svc();

      // Act
      const result = await svc.foo();

      // Assert
      expect(result).toBeNull();
    });

    it('uses the cache if it is initialized', async () => {
      // Arrange
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

      // Act
      const res = await svc.foo(CachedDecoratorFixture.exampleArg);

      // Assert
      expect(res).toBe('cached-value');
      expect(fakeCache.get).toHaveBeenCalled();
    });

    it('computes and stores value in cache if it does not exist', async () => {
      // Arrange
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

      // Act
      const res = await svc.foo(CachedDecoratorFixture.exampleArg);

      // Assert
      expect(res).toBe(`${CachedDecoratorFixture.calcPrefix}${CachedDecoratorFixture.exampleArg}`);
      expect(fakeCache.set).toHaveBeenCalledWith(
        expect.any(String),
        `${CachedDecoratorFixture.calcPrefix}${CachedDecoratorFixture.exampleArg}`,
        CachedDecoratorFixture.CachedTimer * 1000,
      );
    });

    it('handles propertyKey as symbol in Cached', async () => {
      // Arrange
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

      // Act
      const res = await svc[CachedDecoratorFixture.symbolKey]();

      // Assert
      expect(res).toBe(CachedDecoratorFixture.testReturn);
    });

    it('returns descriptor if original method is undefined', () => {
      // Arrange
      const desc: any = { value: undefined };

      // Act
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = Cached(CachedDecoratorFixture.CachedTimer)({}, CachedDecoratorFixture.exampleKey, desc);

      // Assert
      expect(result).toBe(desc);
    });
  });
