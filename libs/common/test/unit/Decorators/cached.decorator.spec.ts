/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// Do NOT import the decorator at the top!
import { CacheAccessor } from '@common/cache/cacheAccessor';
import { CommonErrorMessageConstants } from '@common/constants';
import { ApiFailureResponse } from '@common/responses';
import { EApiResponseMessageType } from '@common/responses/apiResponseMessageType';

import { CachedDecoratorFixture } from './cached.decorator.fixture';

// Local mock for apiResponseFailure
const apiResponseFailure = jest.fn((_i18n: unknown, msgs: any[]) => ({
  success: false,
  messageList: msgs.map((msg: any) => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    type: msg.type,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    message: msg.message,
  })),
  code: undefined,
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@common/responses', () => ({
  ...jest.requireActual('@common/responses'),
  apiResponseFailure,
}));

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (CacheAccessor as any)._cache = null;
  apiResponseFailure.mockClear();
});

describe('Cached Decorator', () => {
  it('returns an i18n error if cache is missing and I18nService is provided', async () => {
    const { Cached } = await import('@common/cache/decorators/cached.decorator');

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
    const res = (await svc.demo(10)) as ApiFailureResponse;

    expect(apiResponseFailure).toHaveBeenCalled();
    expect(i18n.translate).toHaveBeenCalledWith(CommonErrorMessageConstants.redisCacheNotInitialized);
    expect(res.success).toBe(false);
    expect(res.messageList?.[0]?.type).toBe(EApiResponseMessageType.Error);
    expect(res.messageList?.[0]?.message).toContain('redisCacheNotInitialized');
  });

  it('returns null if cache is missing and I18nService is not provided', async () => {
    const { Cached } = await import('@common/cache/decorators/cached.decorator');

    class Svc {
      @Cached(CachedDecoratorFixture.CachedTimer)
      async foo(): Promise<any> {
        throw new Error(CachedDecoratorFixture.noCachedError);
      }
    }
    const svc = new Svc();
    expect(await svc.foo()).toBeNull();
  });
});
