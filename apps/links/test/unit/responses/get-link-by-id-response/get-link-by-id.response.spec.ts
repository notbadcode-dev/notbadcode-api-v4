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

  it('should assign group link data when provided', () => {
    // Arrange
    const partial = GetLinkByIdResponseFixture.partialResponseWithGroup();

    // Act
    const response = new GetLinkByIdResponse(partial);

    // Assert
    expect(response).toBeInstanceOf(GetLinkByIdResponse);
    expect(response.groupLinkId).toBe(partial.groupLinkId);
    expect(response.groupLink).toBeDefined();
    expect(response.groupLink?.id).toBe(partial.groupLink?.id);
    expect(response.groupLink?.title).toBe(partial.groupLink?.title);
    expect(response.groupLink?.color).toEqual(partial.groupLink?.color);
    expect(response.groupLink?.icon).toBe(partial.groupLink?.icon);
  });

  it('should assign null group link when no group is provided', () => {
    // Arrange
    const partial = GetLinkByIdResponseFixture.partialResponseWithNullGroup();

    // Act
    const response = new GetLinkByIdResponse(partial);

    // Assert
    expect(response).toBeInstanceOf(GetLinkByIdResponse);
    expect(response.groupLinkId).toBeNull();
    expect(response.groupLink).toBeNull();
  });
});
