import { GetGroupLinkByIdResponse } from '@apps/links/src/application/responses/get-group-link-by-id.response';

import { GetGroupLinkByIdResponseFixture } from './get-group-link-by-id.response.fixture';

describe('GetGroupLinkByIdResponse', () => {
  it('should assign provided partial values to the instance', () => {
    // Arrange
    const partial = GetGroupLinkByIdResponseFixture.partialResponse();

    // Act
    const response = new GetGroupLinkByIdResponse(partial);

    // Assert
    expect(response).toBeInstanceOf(GetGroupLinkByIdResponse);
    expect(response).toMatchObject(partial);
  });

  it('should create an empty instance when no partial is provided', () => {
    // Act
    const response = new GetGroupLinkByIdResponse();

    // Assert
    expect(response).toBeInstanceOf(GetGroupLinkByIdResponse);
    expect(response.id).toBeUndefined();
    expect(response.title).toBeUndefined();
  });

  it('should assign links data when provided', () => {
    // Arrange
    const partial = GetGroupLinkByIdResponseFixture.partialResponseWithLinks();

    // Act
    const response = new GetGroupLinkByIdResponse(partial);

    // Assert
    expect(response).toBeInstanceOf(GetGroupLinkByIdResponse);
    expect(response.links).toHaveLength(2);
    expect(response.links?.[0]?.id).toBe(partial.links?.[0]?.id);
    expect(response.links?.[0]?.url).toBe(partial.links?.[0]?.url);
    expect(response.links?.[1]?.id).toBe(partial.links?.[1]?.id);
    expect(response.links?.[1]?.url).toBe(partial.links?.[1]?.url);
  });

  it('should assign empty links array when group has no links', () => {
    // Arrange
    const partial = GetGroupLinkByIdResponseFixture.partialResponse();

    // Act
    const response = new GetGroupLinkByIdResponse(partial);

    // Assert
    expect(response).toBeInstanceOf(GetGroupLinkByIdResponse);
    expect(response.links).toEqual([]);
  });

  it('should assign parentGroupLinkId when provided', () => {
    // Arrange
    const partial = GetGroupLinkByIdResponseFixture.partialResponseWithParent();

    // Act
    const response = new GetGroupLinkByIdResponse(partial);

    // Assert
    expect(response).toBeInstanceOf(GetGroupLinkByIdResponse);
    expect(response.parentGroupLinkId).toBe(partial.parentGroupLinkId);
  });
});
