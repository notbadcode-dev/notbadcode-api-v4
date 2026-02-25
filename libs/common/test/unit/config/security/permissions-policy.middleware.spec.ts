import { permissionsPolicyMiddleware } from '@common/config/security/permissions-policy.middleware';

import type { NextFunction, Request, Response } from 'express';


describe('permissionsPolicyMiddleware', () => {
  it('sets Permissions-Policy header and calls next', () => {
    const setHeader = jest.fn();
    const next = jest.fn();
    const req = {} as Request;
    const res = { setHeader } as unknown as Response;

    permissionsPolicyMiddleware(req, res, next as NextFunction);

    expect(setHeader).toHaveBeenCalledTimes(1);
    expect(setHeader).toHaveBeenCalledWith(
      'Permissions-Policy',
      expect.stringContaining('camera=()'),
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
});
