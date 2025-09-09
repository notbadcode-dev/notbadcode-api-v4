export class HashServiceFixture {
  static plainPassword(): string {
    return 'password123';
  }

  static anotherPassword(): string {
    return 'anotherPassword';
  }

  static validHash(): string {
    return 'hashedPassword';
  }

  static invalidHash(): string {
    return 'invalidHash';
  }
}
