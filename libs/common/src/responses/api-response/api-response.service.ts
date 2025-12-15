import { Injectable } from '@nestjs/common';

import { ApiFailureResponse, ApiSuccessResponse } from './api-response';
import { EApiResponseMessageType } from './api-response-message-type';

@Injectable()
export class ApiResponseService {
  success<T>(data: T, messages: string[] = [], code?: string): ApiSuccessResponse<T> {
    return {
      success: true,
      messageList: messages.map((m) => ({
        type: EApiResponseMessageType.Info,
        message: m,
      })),
      data,
      code,
    };
  }

  error(messages: string[] = [], code?: string): ApiFailureResponse {
    return {
      success: false,
      messageList: messages.map((m) => ({
        type: EApiResponseMessageType.Error,
        message: m,
      })),
      code,
    };
  }

  warning(messages: string[] = [], code?: string): ApiFailureResponse {
    return {
      success: false,
      messageList: messages.map((m) => ({
        type: EApiResponseMessageType.Warning,
        message: m,
      })),
      code,
    };
  }
}
