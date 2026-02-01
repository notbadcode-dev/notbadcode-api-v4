import { type ConfigService } from '@nestjs/config';
import { type TypeOrmModuleOptions } from '@nestjs/typeorm';

import { User } from '@apps/auth/src/domain/entities/user.entity';

export const getAuthDbConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mariadb',
  host: configService.get<string>('AUTH_DB_HOST'),
  port: Number(configService.get<number>('AUTH_DB_PORT')),
  username: configService.get<string>('AUTH_DB_USER'),
  password: configService.get<string>('AUTH_DB_PASS'),
  database: configService.get<string>('AUTH_DB_NAME'),
  entities: [User],
  synchronize: false,
  logging: configService.get<string>('NODE_ENV') !== 'production',
});
