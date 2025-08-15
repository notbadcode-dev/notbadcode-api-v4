export function makeUser(
  partial: Partial<{ id: number; email: string; passwordHash: string; deletedAt: Date | null }> = {},
) {
  return {
    id: 1,
    email: 'test@test.com',
    passwordHash: 'hashed',
    deletedAt: null,
    ...partial,
  };
}
