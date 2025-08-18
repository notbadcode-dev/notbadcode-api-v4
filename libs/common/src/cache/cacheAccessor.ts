import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import type { Cache } from 'cache-manager';

@Injectable()
export class CacheAccessor implements OnModuleInit {
  private static _cache: Cache | null = null;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  onModuleInit(): void {
    CacheAccessor._cache = this.cache;
  }

  static get cache(): Cache | null {
    return CacheAccessor._cache;
  }
}
