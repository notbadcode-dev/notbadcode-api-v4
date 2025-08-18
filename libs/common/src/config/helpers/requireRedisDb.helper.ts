import { ENV_REDIS_SCHEMES } from '../environment';

import type Joi from 'joi';

export const REDIS_DB_SUFFIX = /\/\d+$/;

export const requireRedisDbIndex = (value: string, helpers: Joi.CustomHelpers) => {
  try {
    const u = new URL(value);
    const db = (u.pathname || '').replace(/^\//, '');
    if (!/^\d+$/.test(db)) {
      return helpers.error('any.custom', { message: 'Redis URL debe incluir el índice de DB, p.ej. /0' });
    }
    const scheme = u.protocol.replace(':', '');
    if (!ENV_REDIS_SCHEMES.includes(scheme)) {
      return helpers.error('any.custom', { message: `Esquema no permitido (${scheme}).` });
    }
    return value;
  } catch {
    return helpers.error('string.uri', { value });
  }
};
