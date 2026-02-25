import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


import { JwtAuthGuard } from '@common/guards';
import { type CommonSessionControlService } from '@common/redis/session';

import { JwtAuthGuardFixture } from './jwt-auth.guard.fixture';

import type { ExecutionContext } from '@nestjs/common';

const createContext = (authorization?: string): ExecutionContext => {
  const req = { headers: { authorization } };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as unknown as ExecutionContext;
};

const createMockSessionService = (session: unknown = JwtAuthGuardFixture.validSession): CommonSessionControlService =>
  ({
    getSession: jest.fn().mockResolvedValue(session),
    getUserSessionKey: jest.fn().mockReturnValue('session::1:uuid'),
  }) as unknown as CommonSessionControlService;

describe('JwtAuthGuard (unit)', () => {
  const jwtService = new JwtService({ secret: JwtAuthGuardFixture.secret });

  it('can be constructed', () => {
    expect(() => new JwtAuthGuard(jwtService, createMockSessionService())).not.toThrow();
  });

  it('allows request with valid access token and active session', async () => {
    const guard = new JwtAuthGuard(jwtService, createMockSessionService());
    const token = await jwtService.signAsync(JwtAuthGuardFixture.validPayload);
    const context = createContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('attaches payload to request', async () => {
    const guard = new JwtAuthGuard(jwtService, createMockSessionService());
    const token = await jwtService.signAsync(JwtAuthGuardFixture.validPayload);
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    const context = {
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;

    await guard.canActivate(context);
    expect(req.user).toMatchObject(JwtAuthGuardFixture.validPayload);
  });

  it('throws UnauthorizedException when token missing', async () => {
    const guard = new JwtAuthGuard(jwtService, createMockSessionService());
    const context = createContext();
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException for refresh token', async () => {
    const guard = new JwtAuthGuard(jwtService, createMockSessionService());
    const token = await jwtService.signAsync(JwtAuthGuardFixture.refreshPayload);
    const context = createContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when session not found in Redis', async () => {
    const guard = new JwtAuthGuard(jwtService, createMockSessionService(null));
    const token = await jwtService.signAsync(JwtAuthGuardFixture.validPayload);
    const context = createContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rethrows ServiceUnavailableException when session store fails', async () => {
    const failingSessionService = {
      getSession: jest.fn().mockRejectedValue(new ServiceUnavailableException('Session store unavailable')),
      getUserSessionKey: jest.fn().mockReturnValue('session::1:uuid'),
    } as unknown as CommonSessionControlService;
    const guard = new JwtAuthGuard(jwtService, failingSessionService);
    const token = await jwtService.signAsync(JwtAuthGuardFixture.validPayload);
    const context = createContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
