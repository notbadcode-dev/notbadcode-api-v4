import request from 'supertest';

describe('Health Check API (e2e)', () => {
  const AUTH_URL = process.env.AUTH_SERVICE_URL || 'https://localhost:60200';
  const LINKS_URL = process.env.LINKS_SERVICE_URL || 'https://localhost:60201';

  describe('Auth Service - GET /healthz', () => {
    it('should return 200 and healthy status', async () => {
      const response = await request(AUTH_URL).get('/healthz').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.serviceName).toContain('Auth');
      expect(response.body.data.timestamp).toBeDefined();
    });
  });

  describe('Links Service - GET /healthz', () => {
    it('should return 200 and healthy status', async () => {
      const response = await request(LINKS_URL).get('/healthz').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.serviceName).toContain('Links');
      expect(response.body.data.timestamp).toBeDefined();
    });
  });
});
