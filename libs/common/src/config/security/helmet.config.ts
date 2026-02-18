import { SecurityConstants } from '../../constants/security.constants';

import type { HelmetOptions } from 'helmet';

/**
 * Configuración base de seguridad compartida entre producción y desarrollo
 */
const baseHelmetConfig: HelmetOptions = {
  // HSTS: Fuerza HTTPS por 1 año, incluye subdominios, listo para preload
  hsts: {
    maxAge: SecurityConstants.hstsMaxAgeOneYear,
    includeSubDomains: true,
    preload: true,
  },

  // Referrer-Policy: Solo envía origen en HTTPS, nada en downgrade
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // X-Frame-Options: Previene clickjacking
  frameguard: {
    action: 'deny',
  },

  // X-Content-Type-Options: Previene MIME sniffing
  noSniff: true,

  // X-DNS-Prefetch-Control: Desactiva prefetch DNS
  dnsPrefetchControl: {
    allow: false,
  },

  // X-Download-Options: IE no ejecuta descargas en contexto del sitio
  ieNoOpen: true,

  // X-Permitted-Cross-Domain-Policies: Bloquea políticas Adobe cross-domain
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },

  // Desactiva X-Powered-By (ya lo hace NestJS, pero por si acaso)
  hidePoweredBy: true,

  // Origin-Agent-Cluster: Aísla el origen
  originAgentCluster: true,

  // Cross-Origin headers
  crossOriginEmbedderPolicy: false, // APIs no necesitan esto
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
};

/**
 * Configuración de Helmet para producción
 * CSP restrictivo para APIs puras
 */
export const helmetConfig: HelmetOptions = {
  ...baseHelmetConfig,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
    },
  },
};

/**
 * Configuración de Helmet para desarrollo
 * CSP relajado para permitir Swagger UI
 */
export const helmetConfigDev: HelmetOptions = {
  ...baseHelmetConfig,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://validator.swagger.io'],
      fontSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
};
