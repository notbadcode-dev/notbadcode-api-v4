import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ExecutionContext } from '@nestjs/common';

import { JwtAuthGuard } from '@common/guards';
import { JwtAuthGuardFixture } from './jwt-auth.guard.fixture';

const createContext = (authorization?: string): ExecutionContext => {
  const req = { headers: { authorization } };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as unknown as ExecutionContext;
};

describe('JwtAuthGuard (unit)', () => {
  const jwtService = new JwtService({ secret: JwtAuthGuardFixture.secret });
  const guard = new JwtAuthGuard(jwtService);

  it('can be constructed', () => {
    expect(() => new JwtAuthGuard(jwtService)).not.toThrow();
  });

  it('allows request with valid access token', async () => {
    const token = await jwtService.signAsync(JwtAuthGuardFixture.validPayload);
    const context = createContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('attaches payload to request', async () => {
    const token = await jwtService.signAsync(JwtAuthGuardFixture.validPayload);
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    const context = {
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;

    await guard.canActivate(context);
    expect(req.user).toMatchObject(JwtAuthGuardFixture.validPayload);
  });

  it('throws UnauthorizedException when token missing', async () => {
    const context = createContext();
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException for refresh token', async () => {
    const token = await jwtService.signAsync(JwtAuthGuardFixture.refreshPayload);
    const context = createContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
