import request from 'supertest';

import { AuthHelper } from '@test/e2e/utils/auth.helper';
import { GroupLinksHelper } from '@test/e2e/utils/group-links.helper';
import { LinksHelper } from '@test/e2e/utils/links.helper';

describe('Dashboard Totals API (e2e)', () => {
  const LINKS_URL = process.env.LINKS_SERVICE_URL || 'https://localhost:60201';
  let authHelper: AuthHelper;
  let linksHelper: LinksHelper;
  let groupLinksHelper: GroupLinksHelper;
  let accessToken: string;

  beforeAll(async () => {
    authHelper = new AuthHelper();
    linksHelper = new LinksHelper();
    groupLinksHelper = new GroupLinksHelper();

    const testUser = authHelper.createTestUser('dashboard');
    const tokens = await authHelper.register(testUser.email, testUser.password);
    accessToken = tokens.accessToken;

    // Get userId by calling some endpoint or decode token if possible,
    // but for counts we just need the same user creating items.
  });

  it('should return correct totals for links and groups', async () => {
    // 1. Create 2 links
    await linksHelper.createLink(accessToken, linksHelper.createTestLink('total1'));
    await linksHelper.createLink(accessToken, linksHelper.createTestLink('total2'));

    // 2. Create 1 group
    await groupLinksHelper.createGroupLink(accessToken, {
      title: 'Total Group',
    } as any);

    // Act
    const response = await request(LINKS_URL).get('/dashboard-links/summary').set('Authorization', `Bearer ${accessToken}`).expect(200);

    // Assert
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalLinks).toBeGreaterThanOrEqual(2);
    expect(response.body.data.totalGroups).toBeGreaterThanOrEqual(1);
  });

  it('should return zero totals for new user', async () => {
    const newUser = authHelper.createTestUser('newdash');
    const tokens = await authHelper.register(newUser.email, newUser.password);

    const response = await request(LINKS_URL).get('/dashboard-links/summary').set('Authorization', `Bearer ${tokens.accessToken}`).expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.totalLinks).toBe(0);
    expect(response.body.data.totalGroups).toBe(0);
  });
});
