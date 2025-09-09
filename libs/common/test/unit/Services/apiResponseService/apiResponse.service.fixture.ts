/* eslint-disable no-restricted-syntax */
import { type ApiResponseMessage } from '@common/responses';
import { EApiResponseMessageType } from '@common/responses/apiResponseMessageType';

export class ApiResponseServiceFixture {
  static readonly dataObj = { foo: 'bar' } as const;
  static readonly dataNumber = 123;

  static readonly okCode = 'OK_200';
  static readonly errCode = 'ERR_500';
  static readonly warnCode = 'WARN_001';

  static readonly successMessages = ['All good', 'Processed'] as const;
  static readonly errorMessages = ['Critical error'] as const;
  static readonly warningMessages = ['Warning 1', 'Warning 2'] as const;

  static expectedInfoList(messages: readonly string[]): ApiResponseMessage[] {
    return messages.map((m) => ({ type: EApiResponseMessageType.Info, message: m }));
  }

  static expectedErrorList(messages: readonly string[]): ApiResponseMessage[] {
    return messages.map((m) => ({ type: EApiResponseMessageType.Error, message: m }));
  }

  static expectedWarningList(messages: readonly string[]): ApiResponseMessage[] {
    return messages.map((m) => ({ type: EApiResponseMessageType.Warning, message: m }));
  }
}
