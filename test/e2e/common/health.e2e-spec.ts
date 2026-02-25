import request from 'supertest';

describe('Health Checks (e2e)', () => {
  const AUTH_URL = process.env.AUTH_SERVICE_URL || 'https://localhost:60200';
  const LINKS_URL = process.env.LINKS_SERVICE_URL || 'https://localhost:60201';

  describe('Auth Service Health', () => {
    it('should return 200 OK for /healthz', async () => {
      const response = await request(AUTH_URL).get('/healthz').expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.serviceName).toBeDefined();
    });
  });

  describe('Links Service Health', () => {
    it('should return 200 OK for /healthz', async () => {
      const response = await request(LINKS_URL).get('/healthz').expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.serviceName).toBeDefined();
    });
  });
});
