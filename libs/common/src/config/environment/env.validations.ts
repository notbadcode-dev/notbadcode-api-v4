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
import { REDIS_DB_SUFFIX } from '../helpers/require-redis-db.helper';

// --- Auth Servicio ---
const authServiceSchema = {
  [ENV_KEYS.AUTH_SERVICE_NAME]: Joi.string().trim().default(ENV_DEFAULTS[ENV_KEYS.AUTH_SERVICE_NAME]),
  [ENV_KEYS.AUTH_PORT]: Joi.number().port().default(ENV_DEFAULTS[ENV_KEYS.AUTH_PORT]),
};

// --- Links Servicio ---
const linksServiceSchema = {
  [ENV_KEYS.LINKS_SERVICE_NAME]: Joi.string().trim().default(ENV_DEFAULTS[ENV_KEYS.LINKS_SERVICE_NAME]),
  [ENV_KEYS.LINKS_PORT]: Joi.number().port().default(ENV_DEFAULTS[ENV_KEYS.LINKS_PORT]),
};

// --- JWT ---
const jwtSchema = {
  [ENV_KEYS.AUTH_JWT_SECRET]: Joi.string().min(AUTH_JWT_SECRET_MIN_LENGTH).trim().required(),
  [ENV_KEYS.AUTH_JWT_EXPIRES_IN]: Joi.alternatives()
    .try(Joi.string().pattern(AUTH_JWT_EXPIRES_IN_PATTERN))
    .try(Joi.number().integer().positive())
    .default(ENV_DEFAULTS[ENV_KEYS.AUTH_JWT_EXPIRES_IN]),
  [ENV_KEYS.AUTH_JWT_REFRESH_EXPIRES_IN]: Joi.alternatives()
    .try(Joi.string().pattern(AUTH_JWT_EXPIRES_IN_PATTERN))
    .try(Joi.number().integer().positive())
    .default(ENV_DEFAULTS[ENV_KEYS.AUTH_JWT_REFRESH_EXPIRES_IN]),
};

// --- Auth database ---
const authDbSchema = {
  [ENV_KEYS.AUTH_DB_HOST]: Joi.string().hostname().allow(CommonConstants.localhostTag).trim().required(),
  [ENV_KEYS.AUTH_DB_PORT]: Joi.number().port().default(ENV_DEFAULTS[ENV_KEYS.AUTH_DB_PORT]),
  [ENV_KEYS.AUTH_DB_USER]: Joi.string().trim().required(),
  [ENV_KEYS.AUTH_DB_PASS]: Joi.string().allow('').trim().required(),
  [ENV_KEYS.AUTH_DB_NAME]: Joi.string().trim().required(),
};

// --- Links database ---
const linksDbSchema = {
  [ENV_KEYS.LINKS_DB_HOST]: Joi.string().hostname().allow(CommonConstants.localhostTag).trim().required(),
  [ENV_KEYS.LINKS_DB_PORT]: Joi.number().port().default(ENV_DEFAULTS[ENV_KEYS.LINKS_DB_PORT]),
  [ENV_KEYS.LINKS_DB_USER]: Joi.string().trim().required(),
  [ENV_KEYS.LINKS_DB_PASS]: Joi.string().allow('').trim().required(),
  [ENV_KEYS.LINKS_DB_NAME]: Joi.string().trim().required(),
};

// --- Global (opcional) database ---
const dbSchema = {
  [ENV_KEYS.DB_ROOT_PASSWORD]: Joi.string().allow('').trim(),
  [ENV_KEYS.DB_HOST]: Joi.string().hostname().allow(CommonConstants.localhostTag).trim(),
  [ENV_KEYS.DB_PORT]: Joi.number().port(),
  [ENV_KEYS.DB_USER]: Joi.string().trim(),
  [ENV_KEYS.DB_PASSWORD]: Joi.string().allow('').trim(),
  [ENV_KEYS.DB_NAME]: Joi.string().trim(),
};

// --- SSL ---
const sslSchema = {
  [ENV_KEYS.SSL_KEY_PATH]: Joi.string().trim().default(ENV_DEFAULTS[ENV_KEYS.SSL_KEY_PATH]),
  [ENV_KEYS.SSL_CERT_PATH]: Joi.string().trim().default(ENV_DEFAULTS[ENV_KEYS.SSL_CERT_PATH]),
};

// --- i18n / Language ---
const i18nSchema = {
  [ENV_KEYS.I18N_DIR]: Joi.string().trim().default(ENV_DEFAULTS[ENV_KEYS.I18N_DIR]),
  [ENV_KEYS.FALLBACK_LANGUAGE]: Joi.string()
    .valid(ESupportedLanguage.English, ESupportedLanguage.Spanish)
    .default(ENV_DEFAULTS[ENV_KEYS.FALLBACK_LANGUAGE]),
};

// --- CORS ---
const corsSchema = {
  [ENV_KEYS.CORS_ORIGINS]: Joi.string().trim().default(ENV_DEFAULTS[ENV_KEYS.CORS_ORIGINS] as string),
};

// --- Throttle / Rate Limiting ---
const throttleSchema = {
  [ENV_KEYS.THROTTLE_TTL]: Joi.number().integer().positive().default(ENV_DEFAULTS[ENV_KEYS.THROTTLE_TTL]),
  [ENV_KEYS.THROTTLE_LIMIT]: Joi.number().integer().positive().default(ENV_DEFAULTS[ENV_KEYS.THROTTLE_LIMIT]),
};

// --- Redis ---
const redisSchema = {
  [ENV_KEYS.REDIS_CACHE_URL]: Joi.string()
    .uri({ scheme: ENV_REDIS_SCHEMES as unknown as string[] })
    .pattern(REDIS_DB_SUFFIX, { name: 'Redis DB index (e.g. /0)' })
    .trim()
    .default(ENV_DEFAULTS[ENV_KEYS.REDIS_CACHE_URL] as string),

  [ENV_KEYS.REDIS_SESSION_URL]: Joi.string()
    .uri({ scheme: ENV_REDIS_SCHEMES as unknown as string[] })
    .pattern(REDIS_DB_SUFFIX, { name: 'Redis DB index (e.g. /0)' })
    .trim()
    .default(ENV_DEFAULTS[ENV_KEYS.REDIS_SESSION_URL] as string),

  [ENV_KEYS.REDIS_CACHE_PASSWORD]: Joi.string()
    .allow('')
    .trim()
    .default(ENV_DEFAULTS[ENV_KEYS.REDIS_CACHE_PASSWORD] as string),

  [ENV_KEYS.REDIS_SESSION_PASSWORD]: Joi.string()
    .allow('')
    .trim()
    .default(ENV_DEFAULTS[ENV_KEYS.REDIS_SESSION_PASSWORD] as string),
};

export const envValidationSchema = Joi.object({
  ...authServiceSchema,
  ...linksServiceSchema,
  ...jwtSchema,
  ...authDbSchema,
  ...linksDbSchema,
  ...dbSchema,
  ...sslSchema,
  ...i18nSchema,
  ...corsSchema,
  ...throttleSchema,
  ...redisSchema,
})
  .with(ENV_KEYS.REDIS_CACHE_URL, [ENV_KEYS.REDIS_SESSION_URL])
  .with(ENV_KEYS.REDIS_SESSION_URL, [ENV_KEYS.REDIS_CACHE_URL])
  .prefs({ abortEarly: false })
  .unknown(true);
