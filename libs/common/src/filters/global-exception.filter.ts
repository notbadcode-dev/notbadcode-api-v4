import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

import { ApiFailureResponse, EApiResponseMessageType } from '@common/responses';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, message } = this.getErrorDetails(exception);

    this.logException(exception, status);

    response.status(status).json({
      success: false,
      data: null,
      messageList: [
        {
          message,
          type: EApiResponseMessageType.Error,
        },
      ],
    } as ApiFailureResponse);
  }

  private getErrorDetails(exception: unknown): { status: number; message: string } {
    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: this.extractHttpExceptionMessage(exception),
      };
    }

    // No exponer detalles internos en producción
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private extractHttpExceptionMessage(exception: HttpException): string {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response !== null && 'message' in response) {
      const msg = (response as { message: unknown }).message;
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg)) {
        const msgArray = msg as string[];
        return msgArray[0] ?? 'Error';
      }
    }

    return exception.message;
  }

  private logException(exception: unknown, status: number): void {
    if (status >= (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      this.logger.error(exception instanceof Error ? exception.message : 'Unknown error', exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(exception instanceof Error ? exception.message : 'Unknown warning');
    }
  }
}
