import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import type { Cache } from 'cache-manager';

@Injectable()
export class CacheAccessor implements OnModuleInit {
  private static _cache: Cache | null = null;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  onModuleInit(): void {
    if (!CacheAccessor._cache) {
      CacheAccessor._cache = this.cache;
    }
  }

  static get cache(): Cache | null {
    return CacheAccessor._cache;
  }

  static get isInitialized(): boolean {
    return CacheAccessor._cache !== null;
  }

  static setCache(cache: Cache) {
    CacheAccessor._cache = cache;
  }
}
