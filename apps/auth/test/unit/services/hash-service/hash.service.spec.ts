import * as bcrypt from 'bcrypt';

import { HashService } from '@apps/auth/src/application/services';

import { HashServiceFixture } from './hash.service.fixture';

jest.mock('bcrypt');

describe('HashService', () => {
  let service: HashService;

  beforeEach(() => {
    service = new HashService();
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('should hash the password with the configured salt rounds', async () => {
      // Arrange
      const plain = HashServiceFixture.plainPassword();
      const hashResult = HashServiceFixture.validHash();
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashResult);

      // Act
      const result = await service.hash(plain);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(plain, expect.any(Number));
      expect(result).toBe(hashResult);
    });
  });

  describe('compare', () => {
    it('should return true if the passwords match', async () => {
      // Arrange
      const plain = HashServiceFixture.plainPassword();
      const hash = HashServiceFixture.validHash();
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.compare(plain, hash);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(plain, hash);
      expect(result).toBe(true);
    });

    it('should return false if the passwords do not match', async () => {
      // Arrange
      const plain = HashServiceFixture.anotherPassword();
      const hash = HashServiceFixture.invalidHash();
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.compare(plain, hash);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(plain, hash);
      expect(result).toBe(false);
    });
  });
});
