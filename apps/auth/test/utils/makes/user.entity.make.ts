import { User } from '@apps/auth/src/domain/entities/user.entity';

export const makeUser = (overrides: Partial<User> = {}): User => {
  const user = new User();

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  user.id = 3;
  user.email = 'test@test.com';
  user.passwordHash = 'hash';
  user.createdAt = new Date();
  user.updatedAt = new Date();
  user.lastLoginAt = null;
  user.lastLogoutAt = null;

  Object.assign(user, overrides);
  return user;
};
