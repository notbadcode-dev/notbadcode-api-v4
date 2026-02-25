import request from 'supertest';

export interface CreateLinkDto {
  url: string;
  title: string;
  description?: string;
  groupLinkId?: number;
  isFavorite?: boolean;
}

export interface UpdateLinkDto {
  url?: string;
  title?: string;
  description?: string;
  groupLinkId?: number;
  isFavorite?: boolean;
}

export class LinksHelper {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.LINKS_SERVICE_URL || 'https://localhost:60201') {
    this.baseUrl = baseUrl;
  }

  async createLink(accessToken: string, data: CreateLinkDto): Promise<any> {
    const response = await request(this.baseUrl).post('/links').set('Authorization', `Bearer ${accessToken}`).send(data).expect(201);

    return response.body.data;
  }

  async getLink(accessToken: string, id: number): Promise<any> {
    const response = await request(this.baseUrl).get(`/links/${id}`).set('Authorization', `Bearer ${accessToken}`).expect(200);

    return response.body.data;
  }

  async updateLink(accessToken: string, id: number, data: UpdateLinkDto): Promise<any> {
    const response = await request(this.baseUrl).patch(`/links/${id}`).set('Authorization', `Bearer ${accessToken}`).send(data).expect(200);

    return response.body.data;
  }

  async deleteLink(accessToken: string, id: number): Promise<any> {
    const response = await request(this.baseUrl).delete(`/links/${id}`).set('Authorization', `Bearer ${accessToken}`).expect(200);

    return response.body.data;
  }

  async getLinksPaginated(accessToken: string, skip: number = 0, take: number = 10): Promise<any> {
    const response = await request(this.baseUrl).post('/links/paginated').set('Authorization', `Bearer ${accessToken}`).send({ skip, take }).expect(201);

    return response.body.data;
  }

  async markLinksAsFavorite(accessToken: string, linkIdList: number[]): Promise<any> {
    const response = await request(this.baseUrl).post('/links/favorite').set('Authorization', `Bearer ${accessToken}`).send({ linkIdList }).expect(201);

    return response.body;
  }

  async unmarkLinksAsFavorite(accessToken: string, linkIdList: number[]): Promise<any> {
    const response = await request(this.baseUrl).post('/links/unfavorite').set('Authorization', `Bearer ${accessToken}`).send({ linkIdList }).expect(201);

    return response.body;
  }

  createTestLink(prefix = 'test'): CreateLinkDto {
    const timestamp = Date.now();
    return {
      url: `https://example.com/${prefix}-${timestamp}`,
      title: `${prefix} Link ${timestamp}`,
      description: `Test description for ${prefix}`,
    };
  }
}
