/* eslint-disable no-restricted-syntax */
import {
  EApiResponseMessageType,
  type ApiFailureResponse,
  type ApiResponseMessage,
  type ApiSuccessResponse,
} from '@common/responses';

export type Tokens = { accessToken: string; refreshToken: string };

export class ApiResponseFixture {
  static readonly sampleObj = { foo: 'bar' } as const;
  static readonly sampleNumber = 1;

  static readonly customSuccessMessages: ApiResponseMessage[] = [
    { message: 'custom.key', type: EApiResponseMessageType.Info },
    { message: 'other.key', type: EApiResponseMessageType.Warning },
  ];

  static readonly customFailureMessages: ApiResponseMessage[] = [
    { message: 'error.key1', type: EApiResponseMessageType.Error },
    { message: 'error.key2', type: EApiResponseMessageType.Error },
  ];

  static readonly code = 'ERR01';

  static success<T>(data: T): ApiSuccessResponse<T> {
    return { success: true, data, messageList: [] };
  }

  static failure(messages: ApiResponseMessage[], code?: string): ApiFailureResponse {
    return { success: false, messageList: messages, code };
  }

  static readonly validTokens: Tokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };
  static readonly emptyTokens: Tokens = { accessToken: '', refreshToken: '' };
}
