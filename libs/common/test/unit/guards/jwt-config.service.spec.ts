import { ConfigService } from '@nestjs/config';

import { JwtConfigService } from '@common/guards/jwt-config.service';

describe('JwtConfigService', () => {
  it('returns jwt options from config service', () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'AUTH_JWT_SECRET') return 'secret-value';
        if (key === 'AUTH_JWT_EXPIRES_IN') return '15m';
        return undefined;
      }),
    } as unknown as ConfigService;

    const service = new JwtConfigService(configService);
    const options = service.createJwtOptions();

    expect(options).toEqual({
      secret: 'secret-value',
      signOptions: {
        expiresIn: '15m',
      },
    });
  });
});
