import { ApiResponseService } from '@common/responses/apiResponse.service';

import { ApiResponseServiceFixture as F } from './apiResponse.service.fixture';

describe('ApiResponseService', () => {
  let service: ApiResponseService;

  beforeEach(() => {
    service = new ApiResponseService();
  });

  describe('success', () => {
    it('should return a success response with data and messages', () => {
      // Arrange
      const data = F.dataObj;
      const messages = [...F.successMessages];
      const code = F.okCode;

      // Act
      const result = service.success(data, messages, code);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.code).toBe(code);
      expect(result.messageList).toHaveLength(messages.length);
      expect(result.messageList).toEqual(F.expectedInfoList(messages));
    });

    it('should default messages and code if not provided', () => {
      // Arrange
      const data = F.dataNumber;

      // Act
      const result = service.success(data);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(F.dataNumber);
      expect(result.code).toBeUndefined();
      expect(result.messageList).toEqual([]);
    });
  });

  describe('error', () => {
    it('should return an error response with messages and code', () => {
      // Arrange
      const messages = [...F.errorMessages];
      const code = F.errCode;

      // Act
      const result = service.error(messages, code);

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(code);
      expect(result.messageList).toEqual(F.expectedErrorList(messages));
    });

    it('should return an error response with empty messages and no code', () => {
      // Act
      const result = service.error();

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBeUndefined();
      expect(result.messageList).toEqual([]);
    });
  });

  describe('warning', () => {
    it('should return a warning response with messages and code', () => {
      // Arrange
      const messages = [...F.warningMessages];
      const code = F.warnCode;

      // Act
      const result = service.warning(messages, code);

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBe(code);
      expect(result.messageList).toEqual(F.expectedWarningList(messages));
    });

    it('should return a warning response with empty messages and no code', () => {
      // Act
      const result = service.warning();

      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toBeUndefined();
      expect(result.messageList).toEqual([]);
    });
  });
});
