import request from 'supertest';

import { AuthHelper } from '@test/e2e/utils/auth.helper';
import { GroupLinksHelper } from '@test/e2e/utils/group-links.helper';
import { LinksHelper } from '@test/e2e/utils/links.helper';

describe('Favorite Group Links API (e2e)', () => {
  const LINKS_URL = process.env.LINKS_SERVICE_URL || 'https://localhost:60201';
  let authHelper: AuthHelper;
  let linksHelper: LinksHelper;
  let groupLinksHelper: GroupLinksHelper;
  let accessToken: string;

  beforeAll(async () => {
    authHelper = new AuthHelper();
    linksHelper = new LinksHelper();
    groupLinksHelper = new GroupLinksHelper();

    const testUser = authHelper.createTestUser('favgroups');
    const tokens = await authHelper.register(testUser.email, testUser.password);
    accessToken = tokens.accessToken;
  });

  it('should return only favorite group links with their links', async () => {
    // 1. Create a favorite group
    const favGroup = await groupLinksHelper.createGroupLink(accessToken, {
      title: 'Favorite Group',
      isFavorite: true,
    } as any);

    // 2. Create a link in that group
    await linksHelper.createLink(accessToken, {
      ...linksHelper.createTestLink('in-fav-group'),
      groupLinkId: favGroup.id,
    });

    // 3. Create a non-favorite group
    await groupLinksHelper.createGroupLink(accessToken, {
      title: 'Regular Group',
      isFavorite: false,
    } as any);

    // Act
    const response = await request(LINKS_URL)
      .get('/group-links/favorite-list')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Assert
    expect(response.body.success).toBe(true);
    expect(response.body.data.groupLinkList).toBeDefined();
    
    // Check that our favGroup is there
    const found = response.body.data.groupLinkList.find((g: any) => g.id === favGroup.id);
    expect(found).toBeDefined();
    expect(found.isFavorite).toBe(true);
    expect(found.links).toHaveLength(1);
    
    // Check that only favorite groups are returned
    response.body.data.groupLinkList.forEach((group: any) => {
      expect(group.isFavorite).toBe(true);
    });
  });

  it('should return empty list if user has no favorite groups', async () => {
    // Create another user
    const otherUser = authHelper.createTestUser('nogroups');
    const otherTokens = await authHelper.register(otherUser.email, otherUser.password);
    
    const response = await request(LINKS_URL)
      .get('/group-links/favorite-list')
      .set('Authorization', `Bearer ${otherTokens.accessToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.groupLinkList).toHaveLength(0);
  });
});
