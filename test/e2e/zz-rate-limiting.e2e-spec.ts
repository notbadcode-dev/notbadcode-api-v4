import request from 'supertest';

describe('Rate Limiting (e2e)', () => {
  const AUTH_URL = process.env.AUTH_SERVICE_URL || 'https://localhost:60200';

  // Default limit is 5 according to AuthConstants
  const LIMIT = 100;

  it('should return 429 when exceeding rate limit on login', async () => {
    let response;
    // We try up to LIMIT + noise (100) to ensure we hit it
    const MAX_ATTEMPTS = LIMIT + 100;

    // Use batches of 10 to speed up but be able to stop
    for (let i = 0; i < MAX_ATTEMPTS; i += 10) {
      const batch = [];
      for (let j = 0; j < 10; j++) {
        batch.push(request(AUTH_URL).post('/auth/login').send({ email: 'test@test.com', password: 'Password123!' }));
      }
      const results = await Promise.all(batch);
      response = results.find((r) => r.status === 429);
      if (response) break;
    }

    if (!response || response.status !== 429) {
      response = await request(AUTH_URL).post('/auth/login').send({ email: 'test@test.com', password: 'Password123!' });
    }

    expect(response.status).toBe(429);
    expect(response.body.messageList[0].message).toContain('ThrottlerException');
  });

  it('should return 429 when exceeding rate limit on register', async () => {
    let response;
    const MAX_ATTEMPTS = LIMIT + 100;

    for (let i = 0; i < MAX_ATTEMPTS; i += 10) {
      const batch = [];
      for (let j = 0; j < 10; j++) {
        batch.push(
          request(AUTH_URL)
            .post('/auth/register')
            .send({ email: `rate-limit-${i}-${j}@test.com`, password: 'Password123!' }),
        );
      }
      const results = await Promise.all(batch);
      response = results.find((r) => r.status === 429);
      if (response) break;
    }

    if (!response || response.status !== 429) {
      response = await request(AUTH_URL).post('/auth/register').send({ email: 'too-many@test.com', password: 'Password123!' });
    }

    expect(response.status).toBe(429);
  });
});
