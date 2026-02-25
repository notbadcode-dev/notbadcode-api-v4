import {
  ApiResponseConstants,
  apiResponseFailure,
  apiResponseSuccess,
  EApiResponseMessageType,
} from '@common/responses';

import { ApiResponseFixture } from './api-response.fixture';

describe('apiResponse', () => {
  let i18nService: { translate: jest.Mock };

  beforeEach(() => {
    i18nService = {
      translate: jest.fn(async (key: string) => `[${key}]_translated`),
    };
  });

    describe('apiResponseSuccess', () => {
      it('should build a success response with data and default message', async () => {
        // Arrange
        const data = ApiResponseFixture.sampleObj;

        // Act
         
        const result = await apiResponseSuccess(i18nService as any, data);

        // Assert
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
        // Arrange
        const data = ApiResponseFixture.sampleNumber;
        const customMessages = ApiResponseFixture.customSuccessMessages;

        // Act
         
        const result = await apiResponseSuccess(i18nService as any, data, customMessages);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data).toBe(data);
        expect(result.messageList).toEqual([
          {
            message: '[custom.key]_translated',
            type: EApiResponseMessageType.Info,
          },
          {
            message: '[other.key]_translated',
            type: EApiResponseMessageType.Warning,
          },
        ]);
      });
    });

    describe('apiResponseFailure', () => {
      it('should build a failure response with default message and code', async () => {
        // Arrange
        const code = ApiResponseFixture.code;

        // Act
         
        const result = await apiResponseFailure(i18nService as any, undefined, code);

        // Assert
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
        // Arrange
        const customMessages = ApiResponseFixture.customFailureMessages;

        // Act
         
        const result = await apiResponseFailure(i18nService as any, customMessages);

        // Assert
        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.messageList).toEqual([
          {
            message: '[error.key1]_translated',
            type: EApiResponseMessageType.Error,
          },
          {
            message: '[error.key2]_translated',
            type: EApiResponseMessageType.Error,
          },
        ]);
      });
    });
  });
