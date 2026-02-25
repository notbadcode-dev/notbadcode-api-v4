import request from 'supertest';

describe('i18n (e2e)', () => {
  const AUTH_URL = process.env.AUTH_SERVICE_URL || 'https://localhost:60200';

  const EXPECTED_ES = 'Solicitud completada con éxito';
  const EXPECTED_EN = 'Request completed successfully';

  describe('Language Resolution via Resolvers', () => {
    it('should return Spanish by default (ES)', async () => {
      const response = await request(AUTH_URL).get('/healthz').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.messageList[0].message).toBe(EXPECTED_ES);
    });

    it('should return English using X-Language header', async () => {
      const response = await request(AUTH_URL).get('/healthz').set('X-Language', 'en').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.messageList[0].message).toBe(EXPECTED_EN);
    });

    it('should return English using lang query parameter', async () => {
      const response = await request(AUTH_URL).get('/healthz?lang=en').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.messageList[0].message).toBe(EXPECTED_EN);
    });

    it('should return English using Accept-Language header', async () => {
      const response = await request(AUTH_URL).get('/healthz').set('Accept-Language', 'en').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.messageList[0].message).toBe(EXPECTED_EN);
    });

    it('should handle unsupported languages by falling back to default (ES)', async () => {
      const response = await request(AUTH_URL).get('/healthz').set('X-Language', 'fr').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.messageList[0].message).toBe(EXPECTED_ES);
    });
  });
});
