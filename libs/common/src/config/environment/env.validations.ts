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

export const envValidationSchema = Joi.object({
  // Auth configuration
  [ENV_KEYS.AUTH_PORT]: Joi.number().port().default(ENV_DEFAULTS[ENV_KEYS.AUTH_PORT]),

  // Auth jwt configuration
  [ENV_KEYS.AUTH_JWT_SECRET]: Joi.string().min(AUTH_JWT_SECRET_MIN_LENGTH).required(),
  [ENV_KEYS.AUTH_JWT_EXPIRES_IN]: Joi.alternatives()
    .try(Joi.string().pattern(AUTH_JWT_EXPIRES_IN_PATTERN))
    .try(Joi.number().integer().positive())
    .default(ENV_DEFAULTS[ENV_KEYS.AUTH_JWT_EXPIRES_IN]),

  // Auth database configuration
  [ENV_KEYS.AUTH_DB_HOST]: Joi.string().hostname().allow(CommonConstants.localhostTag).required(),
  [ENV_KEYS.AUTH_DB_PORT]: Joi.number().port().default(ENV_DEFAULTS[ENV_KEYS.AUTH_DB_PORT]),
  [ENV_KEYS.AUTH_DB_USER]: Joi.string().required(),
  [ENV_KEYS.AUTH_DB_PASS]: Joi.string().allow('').required(),
  [ENV_KEYS.AUTH_DB_NAME]: Joi.string().required().default(ENV_DEFAULTS[ENV_KEYS.AUTH_DB_NAME]),

  // Common database configuration
  [ENV_KEYS.DB_HOST]: Joi.string().hostname().allow(CommonConstants.localhostTag),
  [ENV_KEYS.DB_PORT]: Joi.number().port(),
  [ENV_KEYS.DB_USER]: Joi.string(),
  [ENV_KEYS.DB_PASSWORD]: Joi.string().allow(''),
  [ENV_KEYS.DB_NAME]: Joi.string(),

  // Common configuration
  [ENV_KEYS.SERVICE_NAME]: Joi.string().required().default(ENV_DEFAULTS[ENV_KEYS.SERVICE_NAME]),

  // Common SSL configuration
  [ENV_KEYS.SSL_KEY_PATH]: Joi.string().required().default(ENV_DEFAULTS[ENV_KEYS.SSL_KEY_PATH]),
  [ENV_KEYS.SSL_CERT_PATH]: Joi.string().required().default(ENV_DEFAULTS[ENV_KEYS.SSL_CERT_PATH]),

  // Common Language configuration
  [ENV_KEYS.I18N_DIR]: Joi.string().required().default(ENV_DEFAULTS[ENV_KEYS.I18N_DIR]),
  [ENV_KEYS.FALLBACK_LANGUAGE]: Joi.string()
    .valid(ESupportedLanguage.English, ESupportedLanguage.Spanish)
    .default(ENV_DEFAULTS[ENV_KEYS.FALLBACK_LANGUAGE]),

  // Redis
  [ENV_KEYS.REDIS_URL]: Joi.string()
    .uri({ scheme: ENV_REDIS_SCHEMES })
    .default(ENV_DEFAULTS[ENV_KEYS.REDIS_URL]),
}).unknown(true);
