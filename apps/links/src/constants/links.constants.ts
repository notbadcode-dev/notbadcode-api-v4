export const LinksConstants = {
  nodeInspectHost: '0.0.0.0',
  listenAppMessage: (port: number) => {
    return `Links service is running on port ${port}`;
  },

  swaggerTitle: 'Links Service',
  swaggerDescription: 'API docs for links resources microservice',
  swaggerVersion: '1.0.0',
};
