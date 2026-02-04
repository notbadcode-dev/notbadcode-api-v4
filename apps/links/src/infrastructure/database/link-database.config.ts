import { type ConfigService } from '@nestjs/config';
import { type TypeOrmModuleOptions } from '@nestjs/typeorm';

import { GroupLink } from '@apps/links/src/domain/entities/group-link.entity';
import { Link } from '@apps/links/src/domain/entities/link.entity';

export const getLinksDbConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mariadb',
  host: configService.get<string>('LINKS_DB_HOST'),
  port: Number(configService.get<number>('LINKS_DB_PORT')),
  username: configService.get<string>('LINKS_DB_USER'),
  password: configService.get<string>('LINKS_DB_PASS'),
  database: configService.get<string>('LINKS_DB_NAME'),
  entities: [Link, GroupLink],
  synchronize: false,
  logging: configService.get<string>('NODE_ENV') !== 'production',
});
