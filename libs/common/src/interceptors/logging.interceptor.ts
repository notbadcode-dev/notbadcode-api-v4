import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Observable, tap } from 'rxjs';

import { LoggerConstants } from '@common/constants';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };

interface RequestLogPayload {
  method: string;
  url: string;
  params: Record<string, JsonValue>;
  query: Record<string, JsonValue>;
  body: JsonValue;
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return LoggerConstants.unserializableValue;
  }
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const className = context.getClass().name;
    const handler = context.getHandler().name;
    const handlerName = `${className}.${handler}`;

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const payload: RequestLogPayload = {
      method: req.method,
      url: req.originalUrl ?? req.url,
      params: (req.params ?? {}) as Record<string, JsonValue>,
      query: (req.query ?? {}) as Record<string, JsonValue>,
      body: (req.body ?? null) as JsonValue,
    };

    this.logger.log(
      LoggerConstants.loggingInterceptorIncomingMessage(handlerName) + ' ' + safeStringify(payload),
      handlerName,
    );

    return next.handle().pipe(
      tap((result: unknown) => {
        const elapsedMs = Date.now() - startedAt;

        const outMsg = `${LoggerConstants.loggingInterceptorOutgoingMessage(
          handlerName,
          elapsedMs,
        )} ${safeStringify({ statusCode: res.statusCode, response: result })}`;

        this.logger.log(outMsg, handlerName);
      }),
    );
  }
}
