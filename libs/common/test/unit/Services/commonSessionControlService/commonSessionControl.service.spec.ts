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
    expect(service).toBeDefined();
  });

  it('should generate a session key', () => {
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);
    expect(key).toBe(`${RedisSessionControlConstants.sessionPrefix}:${session.userId}:${session.sessionId}`);
  });

  it('should set a session', async () => {
    cacheMock.set.mockResolvedValue('OK');
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);

    const result = await service.setSession(key, session);

    expect(cacheMock.set).toHaveBeenCalledWith(
      key,
      JSON.stringify(session),
      RedisSessionControlConstants.oneDayTtl,
    );
    expect(result).toBe('OK');
  });

  it('should get a session', async () => {
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);
    cacheMock.get.mockResolvedValue(JSON.stringify(session));

    const result = await service.getSession(key);

    expect(cacheMock.get).toHaveBeenCalledWith(key);
    expect(result).toEqual(session);
  });

  it('should return null if session does not exist', async () => {
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);
    cacheMock.get.mockResolvedValue(undefined);

    const result = await service.getSession(key);

    expect(result).toBeNull();
  });

  it('should delete a session', async () => {
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);
    cacheMock.del.mockResolvedValue(true);

    const result = await service.deleteSession(key);

    expect(cacheMock.del).toHaveBeenCalledWith(key);
    expect(result).toBe(true);
  });

  it('should return null if deleteSession throws', async () => {
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);
    cacheMock.del.mockRejectedValue(new Error('fail'));

    const result = await service.deleteSession(key);

    expect(result).toBeNull();
  });

  it('should return null if setSession throws', async () => {
    cacheMock.set.mockRejectedValue(new Error('fail'));
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);

    const result = await service.setSession(key, session);

    expect(result).toBeNull();
  });

  it('should return null if getSession throws on parse', async () => {
    const session = UserSessionFixture.create();
    const key = service.getUserSessionKey(session);

    cacheMock.get.mockResolvedValue('not-a-json');

    const result = await service.getSession(key);

    expect(result).toBeNull();
  });
});
