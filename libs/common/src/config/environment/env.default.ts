import { ESupportedLanguage } from '@common/enums/';
// eslint-disable-next-line import/order
import { ENV_KEYS } from './env.keys';


export const ENV_DEFAULTS = {
  [ENV_KEYS.AUTH_SERVICE_NAME]: 'unknown-service',
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  [ENV_KEYS.AUTH_PORT]: 60200,

  [ENV_KEYS.LINKS_SERVICE_NAME]: 'unknown-service',
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  [ENV_KEYS.LINKS_PORT]: 60201,

  [ENV_KEYS.AUTH_JWT_EXPIRES_IN]: '15m',
  [ENV_KEYS.AUTH_JWT_REFRESH_EXPIRES_IN]: '7d',

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  [ENV_KEYS.AUTH_DB_PORT]: 3306,
  [ENV_KEYS.AUTH_DB_NAME]: 'mysql',

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  [ENV_KEYS.LINKS_DB_PORT]: 3306,
  [ENV_KEYS.LINKS_DB_NAME]: 'mysql',

  [ENV_KEYS.SSL_KEY_PATH]: 'certs/dev-key.pem',
  [ENV_KEYS.SSL_CERT_PATH]: 'certs/dev-cert.pem',

  [ENV_KEYS.I18N_DIR]: '/app/libs/common/src/i18n',
  [ENV_KEYS.FALLBACK_LANGUAGE]: ESupportedLanguage?.English,

  [ENV_KEYS.CORS_ORIGINS]: 'http://localhost:3000',

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  [ENV_KEYS.THROTTLE_TTL]: 60000,
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  [ENV_KEYS.THROTTLE_LIMIT]: 60,

  [ENV_KEYS.REDIS_CACHE_URL]: 'redis://redis:6379',
  [ENV_KEYS.REDIS_CACHE_PASSWORD]: '',

  [ENV_KEYS.REDIS_SESSION_URL]: 'redis://redis:6379',
  [ENV_KEYS.REDIS_SESSION_PASSWORD]: '',
} as const;

export const AUTH_JWT_SECRET_MIN_LENGTH = 32;
export const AUTH_JWT_EXPIRES_IN_PATTERN = /^(\d+)([smhdwy])?$/i;

export const ENV_REDIS_SCHEMES = ['redis', 'rediss'];
