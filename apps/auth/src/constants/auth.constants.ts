 
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
    defaultLimit: parseInt(process.env.THROTTLE_LIMIT || '5', 10),
    defaultTtl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
  },
};
