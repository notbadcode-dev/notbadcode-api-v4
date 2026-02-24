import { extractUserIdFromRequest } from '@common/decorators';

describe('CurrentUserId decorator', () => {
  let mockRequest: any;

  beforeEach(() => {
    mockRequest = {
      user: {
        sub: 123,
        email: 'test@example.com',
      },
    };
  });

  it('extracts userId from request.user.sub', () => {
    // Arrange
    mockRequest.user.sub = 456;

    // Act
    const result = extractUserIdFromRequest(mockRequest);

    // Assert
    expect(result).toBe(456);
  });

  it('returns the correct userId for valid user payload', () => {
    // Act
    const result = extractUserIdFromRequest(mockRequest);

    // Assert
    expect(result).toBe(123);
  });

  it('returns userId even when it is 0', () => {
    // Arrange
    mockRequest.user.sub = 0;

    // Act
    const result = extractUserIdFromRequest(mockRequest);

    // Assert
    expect(result).toBe(0);
  });

  it('handles large userId values', () => {
    // Arrange
    mockRequest.user.sub = 999999999;

    // Act
    const result = extractUserIdFromRequest(mockRequest);

    // Assert
    expect(result).toBe(999999999);
  });

  it('extracts userId from user payload with additional fields', () => {
    // Arrange
    mockRequest.user = {
      sub: 789,
      email: 'user@example.com',
      iat: 1234567890,
      exp: 1234567890,
      jti: 'uuid-123',
    };

    // Act
    const result = extractUserIdFromRequest(mockRequest);

    // Assert
    expect(result).toBe(789);
  });
});
