import request from 'supertest';

import { AuthHelper, type TestUser } from '@test/e2e/utils/auth.helper';

describe('Auth API (e2e) - Phase 1', () => {
  const AUTH_URL = process.env.AUTH_SERVICE_URL || 'https://localhost:60200';
  let authHelper: AuthHelper;
  let testUser: TestUser;

  beforeAll(() => {
    authHelper = new AuthHelper();
  });

  beforeEach(() => {
    testUser = authHelper.createTestUser();
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid credentials and return tokens', async () => {
      const response = await request(AUTH_URL)
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(typeof response.body.data.accessToken).toBe('string');
      expect(typeof response.body.data.refreshToken).toBe('string');
      expect(response.body.data.accessToken.length).toBeGreaterThan(0);
      expect(response.body.data.refreshToken.length).toBeGreaterThan(0);
    });

    it('should return 400 when email format is invalid', async () => {
      const response = await request(AUTH_URL)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: testUser.password,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when password is too weak', async () => {
      const response = await request(AUTH_URL)
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: '123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when request body is empty', async () => {
      const response = await request(AUTH_URL).post('/auth/register').send({}).expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 when email already exists', async () => {
      // First registration
      await authHelper.register(testUser.email, testUser.password);

      // Second registration with same email
      const response = await request(AUTH_URL)
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register user before login tests
      await authHelper.register(testUser.email, testUser.password);
    });

    it('should login with correct credentials and return tokens', async () => {
      const response = await request(AUTH_URL)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should return 401 when credentials are incorrect', async () => {
      const response = await request(AUTH_URL)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 when user does not exist', async () => {
      const nonExistentUser = authHelper.createTestUser('nonexistent');

      const response = await request(AUTH_URL)
        .post('/auth/login')
        .send({
          email: nonExistentUser.email,
          password: nonExistentUser.password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when email format is invalid', async () => {
      const response = await request(AUTH_URL)
        .post('/auth/login')
        .send({
          email: 'not-an-email',
          password: testUser.password,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when request body is empty', async () => {
      const response = await request(AUTH_URL).post('/auth/login').send({}).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      const tokens = await authHelper.register(testUser.email, testUser.password);
      accessToken = tokens.accessToken;
    });

    it('should logout successfully with valid access token', async () => {
      const response = await request(AUTH_URL).post('/auth/logout').set('Authorization', `Bearer ${accessToken}`).expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 401 when no Authorization header is provided', async () => {
      const response = await request(AUTH_URL).post('/auth/logout').expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 when token is invalid', async () => {
      const response = await request(AUTH_URL).post('/auth/logout').set('Authorization', 'Bearer invalid-token-here').expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 when using token after logout', async () => {
      // First logout
      await authHelper.logout(accessToken);

      // Try to use the same token again
      const response = await request(AUTH_URL).post('/auth/logout').set('Authorization', `Bearer ${accessToken}`).expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const tokens = await authHelper.register(testUser.email, testUser.password);
      refreshToken = tokens.refreshToken;
    });

    it('should refresh tokens successfully with valid refresh token', async () => {
      const response = await request(AUTH_URL).post('/auth/refresh').send({ refreshToken }).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.accessToken).not.toBe(refreshToken);
    });

    it('should return 401 when refresh token is invalid', async () => {
      const response = await request(AUTH_URL).post('/auth/refresh').send({ refreshToken: 'invalid-refresh-token' }).expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when request body is empty', async () => {
      const response = await request(AUTH_URL).post('/auth/refresh').send({}).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Integration Flow: Register -> Login -> Logout', () => {
    it('should complete full auth flow successfully', async () => {
      // 1. Register
      const registerResponse = await request(AUTH_URL)
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(registerResponse.body.success).toBe(true);

      // 2. Login
      const loginResponse = await request(AUTH_URL)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      const secondAccessToken = loginResponse.body.data.accessToken;

      // 3. Logout
      const logoutResponse = await request(AUTH_URL).post('/auth/logout').set('Authorization', `Bearer ${secondAccessToken}`).expect(200);

      expect(logoutResponse.body.success).toBe(true);

      // 4. Verify token is invalid after logout
      await request(AUTH_URL).post('/auth/logout').set('Authorization', `Bearer ${secondAccessToken}`).expect(401);
    });
  });
});
