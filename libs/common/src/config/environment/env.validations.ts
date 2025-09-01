import Joi from 'joi';

import { CommonConstants } from '@common/constants/';
import { ESupportedLanguage } from '@common/enums/';

import {
  AUTH_JWT_EXPIRES_IN_PATTERN,
  AUTH_JWT_SECRET_MIN_LENGTH,
  ENV_DEFAULTS,
  ENV_KEYS,
  ENV_REDIS_SCHEMES,
} from '.';
import { REDIS_DB_SUFFIX } from '../helpers/requireRedisDb.helper';

export const envValidationSchema = Joi.object({
  // Auth configuration
  [ENV_KEYS.AUTH_PORT]: Joi.number().port().default(ENV_DEFAULTS[ENV_KEYS.AUTH_PORT]),

  // Auth jwt configuration
  [ENV_KEYS.AUTH_JWT_SECRET]: Joi.string().min(AUTH_JWT_SECRET_MIN_LENGTH).required(),
  [ENV_KEYS.AUTH_JWT_EXPIRES_IN]: Joi.alternatives()
    .try(Joi.string().pattern(AUTH_JWT_EXPIRES_IN_PATTERN))
    .try(Joi.number().integer().positive())
    .default(ENV_DEFAULTS[ENV_KEYS.AUTH_JWT_EXPIRES_IN]),
  [ENV_KEYS.AUTH_JWT_REFRESH_EXPIRES_IN]: Joi.string().min(AUTH_JWT_SECRET_MIN_LENGTH).required(),

  // Auth database configuration
  [ENV_KEYS.AUTH_DB_HOST]: Joi.string().hostname().allow(CommonConstants.localhostTag).required(),
  [ENV_KEYS.AUTH_DB_PORT]: Joi.number().port().default(ENV_DEFAULTS[ENV_KEYS.AUTH_DB_PORT]),
  [ENV_KEYS.AUTH_DB_USER]: Joi.string().required(),
  [ENV_KEYS.AUTH_DB_PASS]: Joi.string().allow('').required(),
  // Si es required, NO pongas default. Si quieres default, quita required.
  [ENV_KEYS.AUTH_DB_NAME]: Joi.string().required(),

  // Common database configuration (opcionales)
  [ENV_KEYS.DB_HOST]: Joi.string().hostname().allow(CommonConstants.localhostTag),
  [ENV_KEYS.DB_PORT]: Joi.number().port(),
  [ENV_KEYS.DB_USER]: Joi.string(),
  [ENV_KEYS.DB_PASSWORD]: Joi.string().allow(''),
  [ENV_KEYS.DB_NAME]: Joi.string(),

  // Common configuration
  [ENV_KEYS.SERVICE_NAME]: Joi.string().default(ENV_DEFAULTS[ENV_KEYS.SERVICE_NAME]),

  // Common SSL configuration  (si das default, no uses required)
  [ENV_KEYS.SSL_KEY_PATH]: Joi.string().default(ENV_DEFAULTS[ENV_KEYS.SSL_KEY_PATH]),
  [ENV_KEYS.SSL_CERT_PATH]: Joi.string().default(ENV_DEFAULTS[ENV_KEYS.SSL_CERT_PATH]),

  // Common Language configuration
  [ENV_KEYS.I18N_DIR]: Joi.string().default(ENV_DEFAULTS[ENV_KEYS.I18N_DIR]),
  [ENV_KEYS.FALLBACK_LANGUAGE]: Joi.string()
    .valid(ESupportedLanguage.English, ESupportedLanguage.Spanish)
    .default(ENV_DEFAULTS[ENV_KEYS.FALLBACK_LANGUAGE]),

  // Redis configuration
  [ENV_KEYS.REDIS_CACHE_URL]: Joi.string()
    .uri({ scheme: ENV_REDIS_SCHEMES as unknown as string[] }) // asegúrate de que ENV_REDIS_SCHEMES sea string[]
    .pattern(REDIS_DB_SUFFIX, { name: 'Redis DB index (e.g. /0)' })
    .default(ENV_DEFAULTS[ENV_KEYS.REDIS_CACHE_URL] as string),

  [ENV_KEYS.REDIS_SESSION_URL]: Joi.string()
    .uri({ scheme: ENV_REDIS_SCHEMES as unknown as string[] })
    .pattern(REDIS_DB_SUFFIX, { name: 'Redis DB index (e.g. /0)' })
    .default(ENV_DEFAULTS[ENV_KEYS.REDIS_SESSION_URL] as string),

  [ENV_KEYS.REDIS_CACHE_PASSWORD]: Joi.string()
    .allow('')
    .default(ENV_DEFAULTS[ENV_KEYS.REDIS_CACHE_PASSWORD] as string),

  [ENV_KEYS.REDIS_SESSION_PASSWORD]: Joi.string()
    .allow('')
    .default(ENV_DEFAULTS[ENV_KEYS.REDIS_SESSION_PASSWORD] as string),
})
  // Si usas dos Redis: exige que si hay uno, haya el otro
  .with(ENV_KEYS.REDIS_CACHE_URL, [ENV_KEYS.REDIS_SESSION_URL])
  .with(ENV_KEYS.REDIS_SESSION_URL, [ENV_KEYS.REDIS_CACHE_URL])
  // No abortar en el primer error ayuda en DX
  .prefs({ abortEarly: false })
  .unknown(true);
