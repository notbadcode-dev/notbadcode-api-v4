import request from 'supertest';

import { AuthHelper } from '@test/e2e/utils/auth.helper';
import { GroupLinksHelper } from '@test/e2e/utils/group-links.helper';
import { LinksHelper } from '@test/e2e/utils/links.helper';

describe('User Isolation (e2e)', () => {
  const LINKS_URL = process.env.LINKS_SERVICE_URL || 'https://localhost:60201';

  let authHelper: AuthHelper;
  let linksHelper: LinksHelper;
  let groupLinksHelper: GroupLinksHelper;

  let userAToken: string;
  let userBToken: string;

  let userALinkId: string;
  let userAGroupId: string;

  beforeAll(async () => {
    authHelper = new AuthHelper();
    linksHelper = new LinksHelper();
    groupLinksHelper = new GroupLinksHelper();

    // Register two users
    const tokensA = await authHelper.register();
    userAToken = tokensA.accessToken;

    const tokensB = await authHelper.register();
    userBToken = tokensB.accessToken;

    // User A creates a link and a group
    const link = await linksHelper.createLink(userAToken, linksHelper.createTestLink('user-a-link'));
    userALinkId = link.id;

    const group = await groupLinksHelper.createGroupLink(userAToken, { title: 'User A Group' });
    userAGroupId = group.id;
  });

  describe('Links Isolation', () => {
    it('should return 404 when User B tries to get User A link', async () => {
      const response = await request(LINKS_URL).get(`/links/${userALinkId}`).set('Authorization', `Bearer ${userBToken}`).expect(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User B tries to update User A link', async () => {
      const response = await request(LINKS_URL).patch(`/links/${userALinkId}`).set('Authorization', `Bearer ${userBToken}`).send({ title: 'Hacked Title' }).expect(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User B tries to delete User A link', async () => {
      const response = await request(LINKS_URL).delete(`/links/${userALinkId}`).set('Authorization', `Bearer ${userBToken}`).expect(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Group Links Isolation', () => {
    it('should return 404 when User B tries to get User A group', async () => {
      const response = await request(LINKS_URL).get(`/group-links/${userAGroupId}`).set('Authorization', `Bearer ${userBToken}`).expect(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User B tries to update User A group', async () => {
      const response = await request(LINKS_URL).patch(`/group-links/${userAGroupId}`).set('Authorization', `Bearer ${userBToken}`).send({ title: 'Hacked Group' }).expect(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User B tries to delete User A group', async () => {
      const response = await request(LINKS_URL).delete(`/group-links/${userAGroupId}`).set('Authorization', `Bearer ${userBToken}`).expect(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when User B tries to creating a link using User A group ID', async () => {
      const linkData = {
        ...linksHelper.createTestLink('hacker-link'),
        groupLinkId: userAGroupId as any,
      };

      const response = await request(LINKS_URL).post('/links').set('Authorization', `Bearer ${userBToken}`).send(linkData).expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
