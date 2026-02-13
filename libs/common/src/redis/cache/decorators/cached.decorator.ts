import { CommonConstants, CommonErrorMessageConstants } from '@common/constants';
import { RedisCacheConstants } from '@common/constants/redis-cache.constants';
import { type I18nService } from '@common/i18n';
import { apiResponseFailure, EApiResponseMessageType } from '@common/responses';

import { CacheAccessor } from '@common/redis/cache/cache-accessor';

type AsyncMethod<This, A extends unknown[], R> = (this: This, ...args: A) => Promise<R>;
type AsyncMethodDecorator = <This, A extends unknown[], R>(
  target: unknown,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<AsyncMethod<This, A, R>>,
) => TypedPropertyDescriptor<AsyncMethod<This, A, R>>;

export function stableReplacer(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const ordered: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) {
      ordered[k] = k.toLowerCase().includes(CommonConstants.passwordTag)
        ? CommonConstants.redactedTag
        : obj[k];
    }
    return ordered;
  }
  return value;
}

export function makeCacheKey(className: string, methodName: string, args: unknown[]): string {
  const safeArgs = args.length === 0 ? '' : `(${JSON.stringify(args, stableReplacer)})`;
  return `${className}:${methodName}${safeArgs}`;
}

export function getClassName(thisArg: unknown): string {
  if (typeof thisArg === 'object' && thisArg !== null) {
    const ctor = (thisArg as { constructor?: { name?: string } }).constructor;
    if (ctor?.name) return ctor.name;
  }
  return RedisCacheConstants.unknownClassName;
}

export async function returnCacheError<R>(i18nService?: I18nService): Promise<R> {
  if (i18nService) {
    const message = await i18nService.translate(CommonErrorMessageConstants.redisCacheNotInitialized);

    return apiResponseFailure(i18nService, [{ message, type: EApiResponseMessageType.Error }]) as R;
  }
  return null as unknown as R;
}

export function Cached(ttlSeconds: number, i18nService?: I18nService): AsyncMethodDecorator {
  return function <This, A extends unknown[], R>(
    _target: unknown,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<AsyncMethod<This, A, R>>,
  ): TypedPropertyDescriptor<AsyncMethod<This, A, R>> {
    const original = descriptor.value;
    if (!original) return descriptor;

    const wrapped: AsyncMethod<This, A, R> = async function (this: This, ...args: A): Promise<R> {
      const cache = CacheAccessor.cache;
      if (!cache) {
        return await returnCacheError(i18nService);
      }

      const className = getClassName(this);
      const methodName =
        typeof propertyKey === RedisCacheConstants.propertySymbol ? propertyKey.toString() : propertyKey;
      const key = makeCacheKey(className, methodName as 'symbol', args);

      const cached = await cache.get<R | undefined>(key);
      if (cached !== undefined) {
        return cached;
      }

      const result = await original.apply(this, args);

      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      await cache.set(key, result, ttlSeconds * 1000);

      return result;
    };

    descriptor.value = wrapped;
    return descriptor;
  };
}
