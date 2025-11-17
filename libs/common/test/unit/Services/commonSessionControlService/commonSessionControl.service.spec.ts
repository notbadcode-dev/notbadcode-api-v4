import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { RedisSessionControlConstants } from '@common/constants/redisSessionControl.constants';
import { CommonSessionControlService } from '@common/redis/session';

import { cacheManagerMock } from '@test/utils/mocks/cache.mock';
import { loggerMock } from '@test/utils/mocks/winston.mock';

import { UserSessionFixture } from './userSession.fixture';

describe('CommonSessionControlService', () => {
  let service: CommonSessionControlService;
  let cacheMock: ReturnType<typeof cacheManagerMock>;

  beforeEach(async () => {
    // Arrange
    cacheMock = cacheManagerMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonSessionControlService, { provide: CACHE_MANAGER, useValue: cacheMock }, { provide: Logger, useValue: loggerMock }],
    }).compile();

    // Act
    service = module.get(CommonSessionControlService);
  });

  it('should be defined', () => {
    // Assert
    expect(service).toBeDefined();
  });

  it('can be constructed manually', () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const factory = () => new CommonSessionControlService(cacheMock as any, loggerMock as any);

    // Assert
    expect(factory).not.toThrow();
  });

  it('should generate a session key', () => {
    // Arrange
    const session = UserSessionFixture.create();

    // Act
    const key = service.getUserSessionKey(session);

    // Assert
    expect(key).toBe(`${RedisSessionControlConstants.sessionPrefix}:${session.userId}:${session.sessionId}`);
  });

  it('should set a session', async () => {
    // Arrange
    cacheMock.set.mockResolvedValue('OK');
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);

    // Act
    const result = await service.setSession(key, session);

    // Assert
    expect(cacheMock.set).toHaveBeenCalledWith(key, JSON.stringify(session), RedisSessionControlConstants.oneDayTtl);
    expect(result).toBe('OK');
  });

  it('should return null and log error if setSession throws', async () => {
    // Arrange
    cacheMock.set.mockRejectedValue(new Error('fail'));
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);

    // Act
    const result = await service.setSession(key, session);

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(loggerMock.error).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should get a session', async () => {
    // Arrange
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);

    cacheMock.get.mockResolvedValue(JSON.stringify(session));

    // Act
    const result = await service.getSession(key);

    // Assert
    expect(cacheMock.get).toHaveBeenCalledWith(key);
    expect(result).toEqual(session);
  });

  it('should return null when session does not exist', async () => {
    // Arrange
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);

    cacheMock.get.mockResolvedValue(null);

    // Act
    const result = await service.getSession(key);

    // Assert
    expect(result).toBeNull();
  });

  it('should return null and log if JSON parse fails', async () => {
    // Arrange
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);

    cacheMock.get.mockResolvedValue('INVALID_JSON');

    // Act
    const result = await service.getSession(key);

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(loggerMock.error).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should delete a session when it exists', async () => {
    // Arrange
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);

    cacheMock.get.mockResolvedValue('sessionData');
    cacheMock.del.mockResolvedValue(true);

    // Act
    const result = await service.deleteSession(key);

    // Assert
    expect(cacheMock.del).toHaveBeenCalledWith(key);
    expect(result).toBe(true);
  });

  it('should return false when session does not exist', async () => {
    // Arrange
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);

    cacheMock.get.mockResolvedValue(null);

    // Act
    const result = await service.deleteSession(key);

    // Assert
    expect(cacheMock.del).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should return null and log when deleteSession throws', async () => {
    // Arrange
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);

    cacheMock.get.mockResolvedValue('sessionData');
    cacheMock.del.mockRejectedValue(new Error('fail'));

    // Act
    const result = await service.deleteSession(key);

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(loggerMock.error).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
