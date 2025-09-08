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
    cacheMock = cacheManagerMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommonSessionControlService,
        { provide: CACHE_MANAGER, useValue: cacheMock },
        { provide: Logger, useValue: loggerMock },
      ],
    }).compile();

    service = module.get<CommonSessionControlService>(CommonSessionControlService);
  });

  it('should be defined', () => {
    // Act & Assert
    expect(service).toBeDefined();
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
    expect(cacheMock.set).toHaveBeenCalledWith(
      key,
      JSON.stringify(session),
      RedisSessionControlConstants.oneDayTtl,
    );
    expect(result).toBe('OK');
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

  it('should return null if session does not exist', async () => {
    // Arrange
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);
    cacheMock.get.mockResolvedValue(undefined);

    // Act
    const result = await service.getSession(key);

    // Assert
    expect(result).toBeNull();
  });

it('should delete a session', async () => {
  // Arrange
  const session = UserSessionFixture.create();
  const key = service.getUserSessionKey(session);

  cacheMock.get.mockResolvedValueOnce('sessionData');
  cacheMock.del.mockResolvedValueOnce(true);

  // Act
  const result = await service.deleteSession(key);

  // Assert
  expect(cacheMock.del).toHaveBeenCalledWith(key);
  expect(result).toBe(true);
});

it('should return null if deleteSession throws', async () => {
  // Arrange
  const session = UserSessionFixture.create();
  const key = service.getUserSessionKey(session);
  cacheMock.get.mockResolvedValueOnce('sessionData'); // Simula que existe
  cacheMock.del.mockRejectedValueOnce(new Error('fail'));

  // Act
  const result = await service.deleteSession(key);

  // Assert
  expect(result).toBeNull();
});

it('should return null if setSession throws', async () => {
  // Arrange
  cacheMock.set.mockRejectedValue(new Error('fail'));
  const session = UserSessionFixture.create();
  const key = service.getUserSessionKey(session);

  // Act
  const result = await service.setSession(key, session);

  // Assert
  expect(result).toBeNull();
});

it('should return null if getSession throws on parse', async () => {
  // Arrange
  const session = UserSessionFixture.create();
  const key = service.getUserSessionKey(session);
  cacheMock.get.mockResolvedValue('not-a-json');

  // Act
  const result = await service.getSession(key);

  // Assert
  expect(result).toBeNull();
});

it('should return false if session does not exist', async () => {
  const session = UserSessionFixture.create();
  const key = service.getUserSessionKey(session);
  cacheMock.get.mockResolvedValueOnce(null);

  const result = await service.deleteSession(key);

  expect(cacheMock.del).not.toHaveBeenCalled();
  expect(result).toBe(false);
});
});
