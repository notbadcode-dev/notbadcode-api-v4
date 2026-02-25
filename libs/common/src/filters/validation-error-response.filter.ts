import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { CommonErrorMessageConstants, SymbolConstants } from '@common/constants';
import { I18nService } from '@common/i18n';
import { ApiFailureResponse, EApiResponseMessageType } from '@common/responses';

interface ValidationErrorResponse {
  message: unknown;
  error?: string;
  statusCode?: number;
}

function parseParams(params: string | undefined): Record<string, string | number> {
  if (!params) return {};
  try {
    const unknownObj: unknown = JSON.parse(params);

    if (
      unknownObj &&
      typeof unknownObj === 'object' &&
      !Array.isArray(unknownObj) &&
      Object.entries(unknownObj).every(
        ([k, v]) => typeof k === 'string' && (typeof v === 'string' || typeof v === 'number'),
      )
    ) {
      return unknownObj as Record<string, string | number>;
    }
    return {};
  } catch {
    return {};
  }
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: BadRequestException, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = typeof exception.getStatus === 'function' ? exception.getStatus() : HttpStatus.BAD_REQUEST;
    const exceptionResponse = exception.getResponse() as ValidationErrorResponse;

    const messages = await this.translateMessages(exceptionResponse.message);

    response.status(status).json({
      success: false,
      data: null,
      messageList: messages.map((message) => ({
        message,
        type: EApiResponseMessageType.Error,
      })),
    } as ApiFailureResponse);
  }

  private async translateMessages(input: unknown): Promise<string[]> {
    if (Array.isArray(input)) {
      return Promise.all(input.map((msg) => this.safeTranslate(msg)));
    }
    if (typeof input === 'string') {
      return [await this.safeTranslate(input)];
    }
    if (input !== undefined) {
      return [JSON.stringify(input)];
    }
    return [await this.i18n.translate(CommonErrorMessageConstants.unknownValidationError)];
  }

  private async safeTranslate(msg: unknown): Promise<string> {
    if (typeof msg === 'string') {
      try {
        const [key, params] = msg.split(SymbolConstants.Pipe);
        const paramObj = parseParams(params);
        const translated = await this.i18n.translate(key, { args: paramObj });
        return String(translated);
      } catch {
        return msg;
      }
    }
    return JSON.stringify(msg);
  }
}
