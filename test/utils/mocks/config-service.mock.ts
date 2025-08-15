import { ConfigService } from '@nestjs/config';

export function createConfigServiceMock(map: Record<string, unknown> = {}) {
  return {
    get: jest.fn((key: string) => map[key]),
    getOrThrow: jest.fn((key: string) => {
      if (!(key in map)) throw new Error(`Missing config key: ${key}`);
      return map[key];
    }),
  } as unknown as jest.Mocked<ConfigService>;
}
