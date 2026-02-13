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

import { CommonConstants, LoggerConstants } from '@common/constants';
import { RequestContextService } from '@common/context';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };

const SENSITIVE_PATTERN = /password|token|secret|authorization|apikey|api_key|credit.?card|cvv|ssn/i;
const CORRELATION_ID_HEADER = 'x-correlation-id';

function sanitizeBody(body: JsonValue): JsonValue {
  if (body === null || typeof body !== 'object') {
    return body;
  }

  if (Array.isArray(body)) {
    return body.map(sanitizeBody);
  }

  const sanitized: Record<string, JsonValue> = {};
  for (const [key, value] of Object.entries(body)) {
    sanitized[key] = SENSITIVE_PATTERN.test(key) ? CommonConstants.redactedTag : sanitizeBody(value);
  }
  return sanitized;
}

interface RequestLogPayload {
  correlationId: string;
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  userId?: string;
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

function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }
  return req.ip ?? 'unknown';
}

interface AuthenticatedRequest extends Request {
  user?: { userId?: string; sub?: string };
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
    const req = http.getRequest<AuthenticatedRequest>();
    const res = http.getResponse<Response>();

    const incomingCorrelationId = req.headers[CORRELATION_ID_HEADER] as string | undefined;
    const correlationId = incomingCorrelationId ?? RequestContextService.generateCorrelationId();
    const ip = getClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) ?? 'unknown';
    const userId = req.user?.userId ?? req.user?.sub;

    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    const requestContext = RequestContextService.createContext({
      correlationId,
      ip,
      userAgent,
      userId,
    });

    const payload: RequestLogPayload = {
      correlationId,
      method: req.method,
      url: req.originalUrl ?? req.url,
      ip,
      userAgent,
      userId,
      params: (req.params ?? {}) as Record<string, JsonValue>,
      query: (req.query ?? {}) as Record<string, JsonValue>,
      body: sanitizeBody((req.body ?? null) as JsonValue),
    };

    return RequestContextService.run(requestContext, () => {
      this.logger.log(
        LoggerConstants.loggingInterceptorIncomingMessage(handlerName) + ' ' + safeStringify(payload),
        handlerName,
      );

      return next.handle().pipe(
        tap((result: unknown) => {
          const elapsedMs = Date.now() - startedAt;

          const sanitizedResponse = sanitizeBody(result as JsonValue);
          const outMsg = `${LoggerConstants.loggingInterceptorOutgoingMessage(
            handlerName,
            elapsedMs,
          )} ${safeStringify({ correlationId, statusCode: res.statusCode, response: sanitizedResponse })}`;

          this.logger.log(outMsg, handlerName);
        }),
      );
    });
  }
}
