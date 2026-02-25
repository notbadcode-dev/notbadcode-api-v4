import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TestUser {
  email: string;
  password: string;
  tokens?: AuthTokens;
}

export class AuthHelper {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.AUTH_SERVICE_URL || 'https://localhost:60200') {
    this.baseUrl = baseUrl;
  }

  async register(email?: string, password?: string): Promise<AuthTokens> {
    const testUser = this.createTestUser();
    const finalEmail = email || testUser.email;
    const finalPassword = password || testUser.password;
    const response = await request(this.baseUrl).post('/auth/register').send({ email: finalEmail, password: finalPassword });

    const createdStatus = HttpStatus.CREATED as number;
    if (response.status !== createdStatus) {
      throw new Error(`Registration failed with status ${response.status}: ${JSON.stringify(response.body)}`);
    }

    const { accessToken, refreshToken } = (response.body as { data: AuthTokens }).data;
    return {
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const okStatus = HttpStatus.OK as number;
    const response = await request(this.baseUrl).post('/auth/login').send({ email, password }).expect(okStatus);

    const { accessToken, refreshToken } = (response.body as { data: AuthTokens }).data;
    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(accessToken: string): Promise<void> {
    const okStatus = HttpStatus.OK as number;
    await request(this.baseUrl).post('/auth/logout').set('Authorization', `Bearer ${accessToken}`).expect(okStatus);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const okStatus = HttpStatus.OK as number;
    const response = await request(this.baseUrl).post('/auth/refresh').send({ refreshToken }).expect(okStatus);

    const { accessToken, refreshToken: newRefreshToken } = (response.body as { data: AuthTokens }).data;
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  createTestUser(prefix = 'test'): TestUser {
    const timestamp = Date.now();
    const randomMultiplier = 10000;
    const random = Math.floor(Math.random() * randomMultiplier);
    return {
      email: `${prefix}_${timestamp}_${random}@test.com`,
      password: 'Test1234!',
    };
  }
}
