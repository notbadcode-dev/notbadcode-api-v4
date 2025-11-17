import { Logger } from '@nestjs/common';

export const loggerMock: jest.Mocked<Logger> = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  fatal: jest.fn(),
  localInstance: new Logger(),
  setContext: jest.fn(),
} as unknown as jest.Mocked<Logger>;
