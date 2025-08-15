import { CommonConstants } from '@common/constants/';

export const SwaggerConstants = {
  defaultTitle: 'NotBadCode API',
  defaultDescription: 'API documentation for NotBadCode microservices',
  defaultVersion: '1.0.0',
  defaultPath: '/docs',
  defaultHost: CommonConstants.localhostTag,
  defaultHUrl: (port: number) => {
    return `http${process.env.SSL_CERT_PATH ? 's' : ''}://localhost:${port}`;
  },
  defaultProtocol: 'https:',
};
