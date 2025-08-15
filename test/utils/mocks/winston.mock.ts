import { LoggerService } from '@nestjs/common';

export const loggerMock: jest.Mocked<LoggerService> = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  setLogLevels: jest.fn(),
};
