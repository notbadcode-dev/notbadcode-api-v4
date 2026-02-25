import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ApiFailureResponse } from '@common/responses';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      // eslint-disable-next-line sonarjs/cognitive-complexity
      tap((data: unknown) => {
        if (data && typeof data === 'object' && 'success' in data && data.success === false) {
          const apiFailure = data as ApiFailureResponse;

          let statusCode = HttpStatus.BAD_REQUEST;

          if (apiFailure.messageList && apiFailure.messageList.length > 0) {
            const msgs = apiFailure.messageList.map((m) => m.message?.toLowerCase() || '');

            if (msgs.some((m) => m.includes('not found') || m.includes('notfound') || m.includes('no encontrado') || m.includes('no existe') || m.includes('noexiste'))) {
              statusCode = HttpStatus.NOT_FOUND;
            } else if (
              msgs.some(
                (m) =>
                  m.includes('unauthorized') ||
                  m.includes('no autorizado') ||
                  m.includes('credentials') ||
                  m.includes('credenciales') ||
                  m.includes('auth.error-message.invalidcredentials') ||
                  m.includes('auth.error-message.unauthorized') ||
                  m.includes('token') ||
                  m.includes('session') ||
                  m.includes('sesión'),
              )
            ) {
              statusCode = HttpStatus.UNAUTHORIZED;
            } else if (
              msgs.some(
                (m) =>
                  m.includes('conflict') ||
                  m.includes('ciclo') ||
                  m.includes('ya existe') ||
                  m.includes('in use') ||
                  m.includes('en uso') ||
                  m.includes('alreadyexists') ||
                  m.includes('already exists'),
              )
            ) {
              statusCode = HttpStatus.CONFLICT;
            }
          }

          if (response.statusCode === (HttpStatus.OK as number) || response.statusCode === (HttpStatus.CREATED as number)) {
            response.status(statusCode);
          }
        }
      }),
    );
  }
}
