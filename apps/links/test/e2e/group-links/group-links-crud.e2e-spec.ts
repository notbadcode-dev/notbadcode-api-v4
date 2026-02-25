import request from 'supertest';

import { AuthHelper } from '@test/e2e/utils/auth.helper';
import { GroupLinksHelper, type CreateGroupLinkDto } from '@test/e2e/utils/group-links.helper';

describe('Group Links CRUD API (e2e)', () => {
  const LINKS_URL = process.env.LINKS_SERVICE_URL || 'https://localhost:60201';
  const authHelper = new AuthHelper();
  const groupLinksHelper = new GroupLinksHelper();

  let accessToken: string;

  beforeAll(async () => {
    const loginData = await authHelper.register();
    accessToken = loginData.accessToken;
  });

  describe('CRUD Operations', () => {
    let createdGroupId: number;
    const groupData: CreateGroupLinkDto = {
      title: `Test Group ${Date.now()}`,
      icon: 'test-icon',
    };

    it('should create a group link', async () => {
      const group = await groupLinksHelper.createGroupLink(accessToken, groupData);
      createdGroupId = group.id;

      expect(group.title).toBe(groupData.title);
      expect(group.icon).toBe(groupData.icon);
    });

    it('should get a group link by ID', async () => {
      const group = await groupLinksHelper.getGroupLinkById(accessToken, createdGroupId);

      expect(group.id).toBe(createdGroupId);
      expect(group.title).toBe(groupData.title);
    });

    it('should update a group link', async () => {
      const updateData = { title: `Updated Group ${Date.now()}` };
      const group = await groupLinksHelper.updateGroupLink(accessToken, createdGroupId, updateData);

      expect(group.title).toBe(updateData.title);
    });

    it('should delete a group link', async () => {
      await groupLinksHelper.deleteGroupLink(accessToken, createdGroupId);
      const response = await request(LINKS_URL).get(`/group-links/${createdGroupId}`).set('Authorization', `Bearer ${accessToken}`).expect(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Pagination', () => {
    it('should return paginated group links', async () => {
      await groupLinksHelper.createGroupLink(accessToken, { title: 'Group 1' });
      await groupLinksHelper.createGroupLink(accessToken, { title: 'Group 2' });

      const skip = 0;
      const take = 2;
      const response = await request(LINKS_URL).post('/group-links/paginated').set('Authorization', `Bearer ${accessToken}`).send({ skip, take }).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeDefined();
      expect(response.body.data.items.length).toBeGreaterThanOrEqual(2);
    });

    it('should respect skip and take', async () => {
      const firstPage = await request(LINKS_URL).post('/group-links/paginated').set('Authorization', `Bearer ${accessToken}`).send({ skip: 0, take: 1 }).expect(201);

      const secondPage = await request(LINKS_URL).post('/group-links/paginated').set('Authorization', `Bearer ${accessToken}`).send({ skip: 1, take: 1 }).expect(201);

      expect(firstPage.body.data.items[0].id).not.toBe(secondPage.body.data.items[0].id);
    });
  });

  describe('Favorites', () => {
    it('should mark multiple group links as favorite', async () => {
      const group1 = await groupLinksHelper.createGroupLink(accessToken, { title: 'Fav Group 1' });
      const group2 = await groupLinksHelper.createGroupLink(accessToken, { title: 'Fav Group 2' });

      const response = await request(LINKS_URL)
        .post('/group-links/favorite')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ groupLinkIdList: [group1.id, group2.id] })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should unmark multiple group links as favorite', async () => {
      const group1 = await groupLinksHelper.createGroupLink(accessToken, { title: 'Unfav Group 1' });
      const group2 = await groupLinksHelper.createGroupLink(accessToken, { title: 'Unfav Group 2' });

      await groupLinksHelper.markGroupLinksAsFavorite(accessToken, [group1.id, group2.id]);

      const response = await request(LINKS_URL)
        .post('/group-links/unfavorite')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ groupLinkIdList: [group1.id, group2.id] })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });
});
