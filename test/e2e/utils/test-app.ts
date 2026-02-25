import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

export class TestApp {
  private static authApp: INestApplication;
  private static linksApp: INestApplication;

  static async createAuthApp(): Promise<INestApplication> {
    if (TestApp.authApp) {
      return TestApp.authApp;
    }

    // Dynamically import to avoid circular dependencies
    const { AuthModule } = await import('@apps/auth/src/auth.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    TestApp.authApp = moduleFixture.createNestApplication();
    await TestApp.authApp.init();

    return TestApp.authApp;
  }

  static async createLinksApp(): Promise<INestApplication> {
    if (TestApp.linksApp) {
      return TestApp.linksApp;
    }

    // Dynamically import to avoid circular dependencies
    const { LinksModule } = await import('@apps/links/src/links.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [LinksModule],
    }).compile();

    TestApp.linksApp = moduleFixture.createNestApplication();
    await TestApp.linksApp.init();

    return TestApp.linksApp;
  }

  static async closeAuthApp(): Promise<void> {
    if (TestApp.authApp) {
      await TestApp.authApp.close();
      TestApp.authApp = null;
    }
  }

  static async closeLinksApp(): Promise<void> {
    if (TestApp.linksApp) {
      await TestApp.linksApp.close();
      TestApp.linksApp = null;
    }
  }

  static async closeAll(): Promise<void> {
    await TestApp.closeAuthApp();
    await TestApp.closeLinksApp();
  }
}
