export const LoggerConstants = {
  path: 'logs',
  defaultServiceName: 'unknown',
  defaultDatePattern: 'YYYY-MM-DD',
  defaultMaxFiles: '30d',
  defaultAppFilename: 'app-%DATE%.log',
  defaultErrorFilename: 'error-%DATE%.log',
  defaultLogLevel: 'info',
  defaultFormat: (
    serviceName: string,
    timestamp: string | number | Date | null | undefined,
    level: string,
    message: string,
    meta: Record<string, unknown> = {},
  ): string => {
    const formattedMeta = Object.keys(meta).length ? JSON.stringify(meta) : '';
    const ts = timestamp ? timestamp.toString() : '';

    return `[${ts}] [${serviceName}] [${level}]: ${message} ${formattedMeta}`;
  },

  loggingInterceptorIncomingMessage: (handlerName: string): string => {
    return `[${handlerName}] Incoming`;
  },

  loggingInterceptorOutgoingMessage: (handlerName: string, ms: number): string => {
    return `[${handlerName}] Outgoing (${ms} ms)`;
  },

  unserializableValue: '"[unserializable]"',
};
