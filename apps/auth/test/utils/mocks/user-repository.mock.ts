export const createUserRepositoryMock = () => ({
  findOne: jest.fn(),
  findByEmail: jest.fn(),
});
