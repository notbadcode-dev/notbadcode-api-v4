import request from 'supertest';

import { AuthHelper } from '@test/e2e/utils/auth.helper';
import { GroupLinksHelper } from '@test/e2e/utils/group-links.helper';
import { LinksHelper } from '@test/e2e/utils/links.helper';

describe('Favorite Links API (e2e)', () => {
  const LINKS_URL = process.env.LINKS_SERVICE_URL || 'https://localhost:60201';
  let authHelper: AuthHelper;
  let linksHelper: LinksHelper;
  let groupLinksHelper: GroupLinksHelper;
  let accessToken: string;

  beforeAll(async () => {
    authHelper = new AuthHelper();
    linksHelper = new LinksHelper();
    groupLinksHelper = new GroupLinksHelper();

    const testUser = authHelper.createTestUser('favlinks');
    const tokens = await authHelper.register(testUser.email, testUser.password);
    accessToken = tokens.accessToken;
  });

  it('should return only favorite links without a group', async () => {
    // 1. Create a favorite link without group
    const favLink = await linksHelper.createLink(accessToken, {
      ...linksHelper.createTestLink('fav-no-group'),
      isFavorite: true,
    });

    // 2. Create a non-favorite link without group
    await linksHelper.createLink(accessToken, {
      ...linksHelper.createTestLink('non-fav-no-group'),
      isFavorite: false,
    });

    // 3. Create a favorite link with group
    const group = await groupLinksHelper.createGroupLink(accessToken, { title: 'Test Group' });
    await linksHelper.createLink(accessToken, {
      ...linksHelper.createTestLink('fav-with-group'),
      isFavorite: true,
      groupLinkId: group.id,
    });

    // Act
    const response = await request(LINKS_URL).get('/links/favorite-list').set('Authorization', `Bearer ${accessToken}`).expect(200);

    // Assert
    expect(response.body.success).toBe(true);
    expect(response.body.data.linkList).toBeDefined();

    // Check that our favLink is there
    const found = response.body.data.linkList.find((l: any) => l.id === favLink.id);
    expect(found).toBeDefined();

    // Check that only links with groupLinkId null and isFavorite true are returned
    // (Note: there might be other links from other tests if the DB is shared,
    // but they should all belong to this userId or we should filter carefully).
    response.body.data.linkList.forEach((link: any) => {
      expect(link.isFavorite).toBe(true);
      expect(link.groupLinkId).toBeNull();
    });
  });

  it('should return empty list if user has no favorites', async () => {
    // Create another user
    const otherUser = authHelper.createTestUser('nofavs');
    const otherTokens = await authHelper.register(otherUser.email, otherUser.password);

    const response = await request(LINKS_URL).get('/links/favorite-list').set('Authorization', `Bearer ${otherTokens.accessToken}`).expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.linkList).toHaveLength(0);
  });
});
