import type { NextFunction, Request, Response } from 'express';

/**
 * Permissions-Policy header middleware
 * Restringe APIs del navegador que no necesita una API REST
 */
export function permissionsPolicyMiddleware(_req: Request, res: Response, next: NextFunction): void {
  const policies = [
    'accelerometer=()',
    'autoplay=()',
    'camera=()',
    'cross-origin-isolated=()',
    'display-capture=()',
    'encrypted-media=()',
    'fullscreen=()',
    'geolocation=()',
    'gyroscope=()',
    'keyboard-map=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'payment=()',
    'picture-in-picture=()',
    'publickey-credentials-get=()',
    'screen-wake-lock=()',
    'sync-xhr=()',
    'usb=()',
    'xr-spatial-tracking=()',
  ];

  res.setHeader('Permissions-Policy', policies.join(', '));
  next();
}
