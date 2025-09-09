type UserRepositoryMock = {
  findOne: jest.Mock;
  findByEmail: jest.Mock;
};

export const createUserRepositoryMock = (): UserRepositoryMock => ({
  findOne: jest.fn(),
  findByEmail: jest.fn(),
});
