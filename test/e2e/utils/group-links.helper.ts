import request from 'supertest';

export interface CreateGroupLinkDto {
  title: string;
  description?: string;
  color?: { r: number; g: number; b: number };
  icon?: string;
  parentGroupLinkId?: number;
  isFavorite?: boolean;
}

export interface UpdateGroupLinkDto {
  title?: string;
  description?: string;
  color?: { r: number; g: number; b: number } | null;
  icon?: string | null;
  parentGroupLinkId?: number | null;
  isFavorite?: boolean;
}

export class GroupLinksHelper {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.LINKS_SERVICE_URL || 'https://localhost:60201') {
    this.baseUrl = baseUrl;
  }

  async createGroupLink(accessToken: string, data: CreateGroupLinkDto): Promise<any> {
    const response = await request(this.baseUrl).post('/group-links').set('Authorization', `Bearer ${accessToken}`).send(data).expect(201);

    return response.body.data;
  }

  async getGroupLinkById(accessToken: string, id: number): Promise<any> {
    const response = await request(this.baseUrl).get(`/group-links/${id}`).set('Authorization', `Bearer ${accessToken}`).expect(200);

    return response.body.data;
  }

  async updateGroupLink(accessToken: string, id: number, data: UpdateGroupLinkDto): Promise<any> {
    const response = await request(this.baseUrl).patch(`/group-links/${id}`).set('Authorization', `Bearer ${accessToken}`).send(data).expect(200);

    return response.body.data;
  }

  async deleteGroupLink(accessToken: string, id: number): Promise<any> {
    const response = await request(this.baseUrl).delete(`/group-links/${id}`).set('Authorization', `Bearer ${accessToken}`).expect(200);

    return response.body.data;
  }

  async getGroupLinksPaginated(accessToken: string, skip: number = 0, take: number = 10): Promise<any> {
    const response = await request(this.baseUrl).post('/group-links/paginated').set('Authorization', `Bearer ${accessToken}`).send({ skip, take }).expect(201);

    return response.body.data;
  }

  async markGroupLinksAsFavorite(accessToken: string, groupLinkIdList: number[]): Promise<any> {
    const response = await request(this.baseUrl).post('/group-links/favorite').set('Authorization', `Bearer ${accessToken}`).send({ groupLinkIdList }).expect(201);

    return response.body.data;
  }

  async unmarkGroupLinksAsFavorite(accessToken: string, groupLinkIdList: number[]): Promise<any> {
    const response = await request(this.baseUrl).post('/group-links/unfavorite').set('Authorization', `Bearer ${accessToken}`).send({ groupLinkIdList }).expect(201);

    return response.body;
  }

  createTestGroupLink(prefix = 'test'): CreateGroupLinkDto {
    const timestamp = Date.now();
    return {
      title: `${prefix} Group ${timestamp}`,
      description: `Test description for ${prefix} group`,
      color: { r: 100, g: 150, b: 200 },
      icon: 'folder',
    };
  }
}
