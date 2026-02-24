import { extractAccessTokenFromRequest } from '@common/decorators';

describe('CurrentAccessToken decorator', () => {
  let mockRequest: any;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
  });

  it('extracts token from Bearer authorization header', () => {
    // Arrange
    mockRequest.headers.authorization = 'Bearer abc123token';

    // Act
    const result = extractAccessTokenFromRequest(mockRequest);

    // Assert
    expect(result).toBe('abc123token');
  });

  it('returns empty string when authorization header is missing', () => {
    // Arrange
    mockRequest.headers = {};

    // Act
    const result = extractAccessTokenFromRequest(mockRequest);

    // Assert
    expect(result).toBe('');
  });

  it('returns empty string when authorization type is not Bearer', () => {
    // Arrange
    mockRequest.headers.authorization = 'Basic abc123token';

    // Act
    const result = extractAccessTokenFromRequest(mockRequest);

    // Assert
    expect(result).toBe('');
  });

  it('returns empty string when token is missing after Bearer', () => {
    // Arrange
    mockRequest.headers.authorization = 'Bearer';

    // Act
    const result = extractAccessTokenFromRequest(mockRequest);

    // Assert
    expect(result).toBe('');
  });

  it('returns empty string when token is empty after Bearer', () => {
    // Arrange
    mockRequest.headers.authorization = 'Bearer ';

    // Act
    const result = extractAccessTokenFromRequest(mockRequest);

    // Assert
    expect(result).toBe('');
  });

  it('handles authorization header with extra spaces', () => {
    // Arrange
    mockRequest.headers.authorization = 'Bearer  token-with-extra-space';

    // Act
    const result = extractAccessTokenFromRequest(mockRequest);

    // Assert
    expect(result).toBe('');
  });

  it('extracts token when authorization header is properly formatted', () => {
    // Arrange
    mockRequest.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.long.token';

    // Act
    const result = extractAccessTokenFromRequest(mockRequest);

    // Assert
    expect(result).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.long.token');
  });

  it('returns empty string when authorization is malformed', () => {
    // Arrange
    mockRequest.headers.authorization = 'InvalidFormat';

    // Act
    const result = extractAccessTokenFromRequest(mockRequest);

    // Assert
    expect(result).toBe('');
  });
});
