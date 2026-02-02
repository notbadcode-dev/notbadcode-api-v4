/* eslint-disable @typescript-eslint/no-magic-numbers */
export const AuthConstants = {
  nodeInspectHost: '0.0.0.0',
  listenAppMessage: (port: number) => {
    return `Auth service is running on port ${port}`;
  },

  swaggerTitle: 'Auth Service',
  swaggerDescription: 'API docs for authentication microservice',
  swaggerVersion: '1.0.0',

  userPasswordMinLength: 6,
  userPasswordMaxLength: 128,
  saltsRounds: 10,

  throttle: {
    defaultLimit: 5,
    defaultTtl: 60000,
  },
};
