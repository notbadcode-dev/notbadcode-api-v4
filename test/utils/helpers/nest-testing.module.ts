import { Test, TestingModule } from '@nestjs/testing';

export async function createTestingModule(
  metadata: Parameters<typeof Test.createTestingModule>[0],
): Promise<TestingModule> {
  const moduleRef = await Test.createTestingModule(metadata).compile();
  return moduleRef;
}
