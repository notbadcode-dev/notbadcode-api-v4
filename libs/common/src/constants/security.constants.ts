export const SecurityConstants = {
  /** Tiempo de cache para preflight CORS en segundos (24 horas) */
  corsMaxAgePreflight24Hrs: 86400,
  /** Tiempo de HSTS en segundos (1 año) */
  hstsMaxAgeOneYear: 31536000,
  /** Límite de tamaño del body en requests (100kb) */
  bodyLimit: '100kb',
} as const;
