import request from 'supertest';

import { AuthHelper } from '@test/e2e/utils/auth.helper';
import { GroupLinksHelper } from '@test/e2e/utils/group-links.helper';
import { LinksHelper } from '@test/e2e/utils/links.helper';

describe('Links CRUD API (e2e) - Phase 1', () => {
  const LINKS_URL = process.env.LINKS_SERVICE_URL || 'https://localhost:60201';
  let authHelper: AuthHelper;
  let linksHelper: LinksHelper;
  let accessToken: string;

  beforeAll(async () => {
    authHelper = new AuthHelper();
    linksHelper = new LinksHelper();

    // Create and login test user
    const testUser = authHelper.createTestUser('links');
    const tokens = await authHelper.register(testUser.email, testUser.password);
    accessToken = tokens.accessToken;
  });

  describe('POST /links (Create)', () => {
    it('should create a link with minimal valid data', async () => {
      const linkData = linksHelper.createTestLink();

      const response = await request(LINKS_URL).post('/links').set('Authorization', `Bearer ${accessToken}`).send(linkData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.url).toBe(linkData.url);
      expect(response.body.data.title).toBe(linkData.title);
    });

    it('should create a link with all fields', async () => {
      const linkData = {
        ...linksHelper.createTestLink(),
        description: 'Full description',
        isFavorite: true,
      };

      const response = await request(LINKS_URL).post('/links').set('Authorization', `Bearer ${accessToken}`).send(linkData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(linkData.description);
      expect(response.body.data.isFavorite).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const linkData = linksHelper.createTestLink();

      const response = await request(LINKS_URL).post('/links').send(linkData).expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when URL is invalid', async () => {
      const linkData = {
        ...linksHelper.createTestLink(),
        url: 'not-a-valid-url',
      };

      const response = await request(LINKS_URL).post('/links').set('Authorization', `Bearer ${accessToken}`).send(linkData).expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when title is empty', async () => {
      const linkData = {
        ...linksHelper.createTestLink(),
        title: '',
      };

      const response = await request(LINKS_URL).post('/links').set('Authorization', `Bearer ${accessToken}`).send(linkData).expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when type is invalid', async () => {
      const linkData = {
        ...linksHelper.createTestLink(),
        type: 'invalid-type',
      } as any;

      const response = await request(LINKS_URL).post('/links').set('Authorization', `Bearer ${accessToken}`).send(linkData).expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create a link associated with a group', async () => {
      const groupHelper = new GroupLinksHelper();
      const group = await groupHelper.createGroupLink(accessToken, { title: 'Test Group for Link' });

      const linkData = {
        ...linksHelper.createTestLink(),
        groupLinkId: group.id,
      };

      const response = await request(LINKS_URL).post('/links').set('Authorization', `Bearer ${accessToken}`).send(linkData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.groupLinkId).toBe(group.id);
    });

    it('should prevent duplicate URL with different casing (Normalization)', async () => {
      const url = `https://UniqueCase-${Date.now()}.com`;
      const link1 = { ...linksHelper.createTestLink(), url: url };
      const link2 = { ...linksHelper.createTestLink(), url: url.toUpperCase() };

      // First one succeeds
      await request(LINKS_URL).post('/links').set('Authorization', `Bearer ${accessToken}`).send(link1).expect(201);

      // Second one fails with 409 Conflict
      const response = await request(LINKS_URL).post('/links').set('Authorization', `Bearer ${accessToken}`).send(link2).expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /links/:id (Get by ID)', () => {
    let createdLinkId: number;

    beforeEach(async () => {
      const linkData = linksHelper.createTestLink();
      const createdLink = await linksHelper.createLink(accessToken, linkData);
      createdLinkId = createdLink.id;
    });

    it('should get an existing link by ID', async () => {
      const response = await request(LINKS_URL).get(`/links/${createdLinkId}`).set('Authorization', `Bearer ${accessToken}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(createdLinkId);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(LINKS_URL).get(`/links/${createdLinkId}`).expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when link does not exist', async () => {
      const nonExistentId = 999999;

      const response = await request(LINKS_URL).get(`/links/${nonExistentId}`).set('Authorization', `Bearer ${accessToken}`).expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when ID is not numeric', async () => {
      const response = await request(LINKS_URL).get('/links/not-a-number').set('Authorization', `Bearer ${accessToken}`).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /links/:id (Update)', () => {
    let createdLinkId: number;

    beforeEach(async () => {
      const linkData = linksHelper.createTestLink();
      const createdLink = await linksHelper.createLink(accessToken, linkData);
      createdLinkId = createdLink.id;
    });

    it('should update link title', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(LINKS_URL).patch(`/links/${createdLinkId}`).set('Authorization', `Bearer ${accessToken}`).send(updateData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.id).toBe(createdLinkId);
    });

    it('should update multiple fields', async () => {
      const updateData = {
        title: 'New Title',
        url: 'https://updated.com/link',
        description: 'Updated description',
        isFavorite: true,
      };

      const response = await request(LINKS_URL).patch(`/links/${createdLinkId}`).set('Authorization', `Bearer ${accessToken}`).send(updateData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.url).toBe(updateData.url);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.isFavorite).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(LINKS_URL).patch(`/links/${createdLinkId}`).send(updateData).expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when link does not exist', async () => {
      const nonExistentId = 999999;
      const updateData = { title: 'Updated Title' };

      const response = await request(LINKS_URL).patch(`/links/${nonExistentId}`).set('Authorization', `Bearer ${accessToken}`).send(updateData).expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when URL is invalid', async () => {
      const updateData = { url: 'invalid-url' };

      const response = await request(LINKS_URL).patch(`/links/${createdLinkId}`).set('Authorization', `Bearer ${accessToken}`).send(updateData).expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when payload is empty', async () => {
      const response = await request(LINKS_URL).patch(`/links/${createdLinkId}`).set('Authorization', `Bearer ${accessToken}`).send({}).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /links/:id (Delete)', () => {
    let createdLinkId: number;

    beforeEach(async () => {
      const linkData = linksHelper.createTestLink();
      const createdLink = await linksHelper.createLink(accessToken, linkData);
      createdLinkId = createdLink.id;
    });

    it('should delete an existing link', async () => {
      const response = await request(LINKS_URL).delete(`/links/${createdLinkId}`).set('Authorization', `Bearer ${accessToken}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(createdLinkId);
    });

    it('should return 404 when trying to get deleted link', async () => {
      // Delete the link
      await linksHelper.deleteLink(accessToken, createdLinkId);

      // Try to get it
      const response = await request(LINKS_URL).get(`/links/${createdLinkId}`).set('Authorization', `Bearer ${accessToken}`).expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(LINKS_URL).delete(`/links/${createdLinkId}`).expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when link does not exist', async () => {
      const nonExistentId = 999999;

      const response = await request(LINKS_URL).delete(`/links/${nonExistentId}`).set('Authorization', `Bearer ${accessToken}`).expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Integration Flow: Create -> Get -> Update -> Delete', () => {
    it('should complete full CRUD flow successfully', async () => {
      // 1. Create
      const linkData = linksHelper.createTestLink('flow');
      const createResponse = await request(LINKS_URL).post('/links').set('Authorization', `Bearer ${accessToken}`).send(linkData).expect(201);

      expect(createResponse.body.success).toBe(true);
      const linkId = createResponse.body.data.id;

      // 2. Get
      const getResponse = await request(LINKS_URL).get(`/links/${linkId}`).set('Authorization', `Bearer ${accessToken}`).expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.id).toBe(linkId);

      // 3. Update
      const updateData = { title: 'Updated in Flow' };
      const updateResponse = await request(LINKS_URL).patch(`/links/${linkId}`).set('Authorization', `Bearer ${accessToken}`).send(updateData).expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.title).toBe(updateData.title);

      // 4. Delete
      const deleteResponse = await request(LINKS_URL).delete(`/links/${linkId}`).set('Authorization', `Bearer ${accessToken}`).expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // 5. Verify deletion
      await request(LINKS_URL).get(`/links/${linkId}`).set('Authorization', `Bearer ${accessToken}`).expect(404);
    });
  });

  describe('POST /links/paginated', () => {
    beforeAll(async () => {
      // Create some links for pagination
      for (let i = 0; i < 5; i++) {
        await linksHelper.createLink(accessToken, linksHelper.createTestLink(`pag-${i}`));
      }
    });

    it('should return paginated links', async () => {
      const skip = 0;
      const take = 2;
      const response = await request(LINKS_URL).post('/links/paginated').set('Authorization', `Bearer ${accessToken}`).send({ skip, take }).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeDefined();
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBeDefined();
      expect(response.body.data.total).toBeGreaterThanOrEqual(5);
    });

    it('should respect offset', async () => {
      const firstPage = await request(LINKS_URL).post('/links/paginated').set('Authorization', `Bearer ${accessToken}`).send({ skip: 0, take: 1 }).expect(201);

      const secondPage = await request(LINKS_URL).post('/links/paginated').set('Authorization', `Bearer ${accessToken}`).send({ skip: 1, take: 1 }).expect(201);

      expect(firstPage.body.data.items[0].id).not.toBe(secondPage.body.data.items[0].id);
    });
  });

  describe('POST /links/favorite & /unfavorite', () => {
    let linkId1: number;
    let linkId2: number;

    beforeEach(async () => {
      const l1 = await linksHelper.createLink(accessToken, linksHelper.createTestLink('fav1'));
      const l2 = await linksHelper.createLink(accessToken, linksHelper.createTestLink('fav2'));
      linkId1 = l1.id;
      linkId2 = l2.id;
    });

    it('should mark multiple links as favorite', async () => {
      const response = await request(LINKS_URL)
        .post('/links/favorite')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ linkIdList: [linkId1, linkId2] })
        .expect(201);

      expect(response.body.success).toBe(true);

      // Verify
      const updatedL1 = await linksHelper.getLink(accessToken, linkId1);
      const updatedL2 = await linksHelper.getLink(accessToken, linkId2);
      expect(updatedL1.isFavorite).toBe(true);
      expect(updatedL2.isFavorite).toBe(true);
    });

    it('should unmark multiple links as favorite', async () => {
      // First mark them
      await linksHelper.markLinksAsFavorite(accessToken, [linkId1, linkId2]);

      const response = await request(LINKS_URL)
        .post('/links/unfavorite')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ linkIdList: [linkId1, linkId2] })
        .expect(201);

      expect(response.body.success).toBe(true);

      // Verify
      const updatedL1 = await linksHelper.getLink(accessToken, linkId1);
      const updatedL2 = await linksHelper.getLink(accessToken, linkId2);
      expect(updatedL1.isFavorite).toBe(false);
      expect(updatedL2.isFavorite).toBe(false);
    });
  });
});
