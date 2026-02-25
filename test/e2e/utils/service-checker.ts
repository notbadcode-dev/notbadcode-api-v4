import request from 'supertest';

export class ServiceChecker {
  static async checkServices(): Promise<{ auth: boolean; links: boolean }> {
    const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:60200';
    const linksUrl = process.env.LINKS_SERVICE_URL || 'http://localhost:60201';

    const results = {
      auth: false,
      links: false,
    };

    // Check Auth service
    try {
      await request(authUrl).get('/health').timeout(2000);
      results.auth = true;
    } catch (error) {
      // Try with /api if /health doesn't exist
      try {
        await request(authUrl).post('/auth/login').send({}).timeout(2000);
        results.auth = true;
      } catch {
        results.auth = false;
      }
    }

    // Check Links service
    try {
      await request(linksUrl).get('/health').timeout(2000);
      results.links = true;
    } catch (error) {
      // Try with /api if /health doesn't exist
      try {
        await request(linksUrl).get('/links/1').timeout(2000);
        results.links = true;
      } catch {
        results.links = false;
      }
    }

    return results;
  }

  static async ensureServicesRunning(): Promise<void> {
    console.log('🔍 Verificando servicios...\n');

    const services = await ServiceChecker.checkServices();

    if (!services.auth) {
      console.error('❌ Auth service no está corriendo en http://localhost:60200');
      console.error('   Ejecuta: npm run start:auth:dev\n');
      process.exit(1);
    }

    if (!services.links) {
      console.error('❌ Links service no está corriendo en http://localhost:60201');
      console.error('   Ejecuta: npm run start:links:dev\n');
      process.exit(1);
    }

    console.log('✅ Auth service: http://localhost:60200');
    console.log('✅ Links service: http://localhost:60201\n');
  }
}
