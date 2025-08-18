import {
  ApiResponseConstants,
  apiResponseFailure,
  apiResponseSuccess,
  EApiResponseMessageType,
} from '@common/responses';

import { ApiResponseFixture } from './apiResponse.fixture';

describe('apiResponse', () => {
  let i18nService: { translate: jest.Mock };

  beforeEach(() => {
    i18nService = {
      translate: jest.fn(async (key: string) => `[${key}]_translated`),
    };
  });

  describe('apiResponseSuccess', () => {
    it('should build a success response with data and default message', async () => {
      const data = ApiResponseFixture.sampleObj;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await apiResponseSuccess(i18nService as any, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.messageList).toEqual([
        {
          message: `[${ApiResponseConstants.defaultApiSuccessResponse}]_translated`,
          type: EApiResponseMessageType.Success,
        },
      ]);
    });

    it('should translate custom messages if provided', async () => {
      const data = ApiResponseFixture.sampleNumber;
      const customMessages = ApiResponseFixture.customSuccessMessages;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await apiResponseSuccess(i18nService as any, data, customMessages);

      expect(result.success).toBe(true);
      expect(result.data).toBe(data);
    });
  });

  describe('apiResponseFailure', () => {
    it('should build a failure response with default message and code', async () => {
      const code = ApiResponseFixture.code;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await apiResponseFailure(i18nService as any, undefined, code);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.code).toBe(code);
      expect(result.messageList).toEqual([
        {
          message: `[${ApiResponseConstants.defaultApiFailureResponse}]_translated`,
          type: EApiResponseMessageType.Error,
        },
      ]);
    });

    it('should translate custom failure messages if provided', async () => {
      const customMessages = ApiResponseFixture.customFailureMessages;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await apiResponseFailure(i18nService as any, customMessages);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.messageList).toEqual([
        { message: '[error.key1]_translated' },
        { message: '[error.key2]_translated' },
      ]);
    });
  });
});
