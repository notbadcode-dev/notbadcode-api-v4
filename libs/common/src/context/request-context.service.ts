import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

export interface RequestContext {
  correlationId: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class RequestContextService {
  private static storage = new AsyncLocalStorage<RequestContext>();

  static run<T>(context: RequestContext, callback: () => T): T {
    return RequestContextService.storage.run(context, callback);
  }

  static getContext(): RequestContext | undefined {
    return RequestContextService.storage.getStore();
  }

  static getCorrelationId(): string | undefined {
    return RequestContextService.getContext()?.correlationId;
  }

  static getUserId(): string | undefined {
    return RequestContextService.getContext()?.userId;
  }

  static generateCorrelationId(): string {
    return randomUUID();
  }

  static createContext(partial: Partial<RequestContext> = {}): RequestContext {
    return {
      correlationId: partial.correlationId ?? RequestContextService.generateCorrelationId(),
      userId: partial.userId,
      ip: partial.ip,
      userAgent: partial.userAgent,
    };
  }
}
