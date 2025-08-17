import {
  type ApiFailureResponse,
  type ApiResponseService,
  type ApiSuccessResponse,
  EApiResponseMessageType,
} from '@common/responses';

export class MockApiResponseService {
  static create(): jest.Mocked<ApiResponseService> {
    const success = <T>(data: T): ApiSuccessResponse<T> => ({
      success: true,
      messageList: [],
      data,
    });

    const error = (messages: string[] = [], code?: string): ApiFailureResponse => ({
      success: false,
      messageList: messages.map((m) => ({
        type: EApiResponseMessageType.Error,
        message: m,
      })),
      code,
    });

    const warning = (messages: string[] = [], code?: string): ApiFailureResponse => ({
      success: false,
      messageList: messages.map((m) => ({
        type: EApiResponseMessageType.Warning,
        message: m,
      })),
      code,
    });

    return {
      success: jest.fn(success),
      error: jest.fn(error),
      warning: jest.fn(warning),
    } as jest.Mocked<ApiResponseService>;
  }
}
