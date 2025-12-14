import { GetLinkByIdResponse } from '@apps/links/src/application/responses/get-link-by-id.response';

import { GetLinkByIdResponseFixture } from './get-link-by-id.response.fixture';

describe('GetLinkByIdResponse', () => {
  it('should assign provided partial values to the instance', () => {
    // Arrange
    const partial = GetLinkByIdResponseFixture.partialResponse();

    // Act
    const response = new GetLinkByIdResponse(partial);

    // Assert
    expect(response).toBeInstanceOf(GetLinkByIdResponse);
    expect(response).toMatchObject(partial);
  });

  it('should create an empty instance when no partial is provided', () => {
    // Act
    const response = new GetLinkByIdResponse();

    // Assert
    expect(response).toBeInstanceOf(GetLinkByIdResponse);
    expect(response.id).toBeUndefined();
    expect(response.url).toBeUndefined();
  });
});
