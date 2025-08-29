export const cacheManagerMock = () => ({
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
});
