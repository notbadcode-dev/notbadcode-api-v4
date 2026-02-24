import { BasePaginatedHandler, type IPaginatableRepository } from '@common/handler';
import { PaginateHelper } from '@common/helpers';
import { type I18nService } from '@common/i18n';
import { type PaginatedRequest } from '@common/requests';
import { type ApiResponse, type PaginatedResponse } from '@common/responses';

import {
  BasePaginatedHandlerFixture,
  type TestEntity,
  type TestResponseDto,
} from './base-paginates.handler.fixture';

class TestBasePaginatedHandler extends BasePaginatedHandler<
  Record<string, never>,
  TestEntity,
  TestResponseDto
> {
  constructor(i18nService: I18nService) {
    super(i18nService);
  }

  async execute(): Promise<ApiResponse<PaginatedResponse<TestResponseDto>>> {
    throw new Error('Not implemented');
  }

  async executeWrapper(
    repository: IPaginatableRepository<TestEntity>,
    request: PaginatedRequest,
    map: (entity: TestEntity) => TestResponseDto,
    notFoundMessage: string,
  ): Promise<ApiResponse<PaginatedResponse<TestResponseDto>>> {
    return this.executePaginated(repository, request, map, notFoundMessage);
  }
}

describe('BasePaginatedHandler', () => {
  let handler: TestBasePaginatedHandler;
  let repository: jest.Mocked<IPaginatableRepository<TestEntity>>;
  let request: PaginatedRequest;

  beforeEach(() => {
    handler = new TestBasePaginatedHandler(BasePaginatedHandlerFixture.i18nStub());
    repository = {
      findAndCount: jest.fn(),
    } as unknown as jest.Mocked<IPaginatableRepository<TestEntity>>;
    request = BasePaginatedHandlerFixture.request();
    jest.clearAllMocks();
  });

  describe('executePaginated', () => {
    it('should map entities and return a success response when data is found', async () => {
      // Arrange
      const paginationOptions = BasePaginatedHandlerFixture.paginationOptions<TestEntity>();
      const entities = BasePaginatedHandlerFixture.entities();
      const total = 50;
      const mappedItems = entities.map((entity) => BasePaginatedHandlerFixture.mapEntityToResponse(entity));
      const paginatedResponse = BasePaginatedHandlerFixture.paginatedResponse(mappedItems);
      const notFoundMessage = BasePaginatedHandlerFixture.notFoundMessage();

      jest.spyOn(PaginateHelper, 'calculateRepositoryPagination').mockReturnValueOnce(
        paginationOptions as never,
      );
      repository.findAndCount.mockResolvedValueOnce([entities, total]);
      const mapper = jest.fn(BasePaginatedHandlerFixture.mapEntityToResponse);
      const paginatedSpy = jest.spyOn(PaginateHelper, 'buildPaginatedResponse').mockReturnValueOnce(
        paginatedResponse,
      );
      const successResponse = BasePaginatedHandlerFixture.successResponse(paginatedResponse);
      const createSuccessSpy = jest
        .spyOn(handler as any, 'createSuccessResponse')
        .mockResolvedValueOnce(successResponse);

      // Act
      const result = await handler.executeWrapper(repository, request, mapper, notFoundMessage);

      // Assert
      expect(PaginateHelper.calculateRepositoryPagination).toHaveBeenCalledWith(request);
      expect(repository.findAndCount).toHaveBeenCalledWith(paginationOptions);
      expect(mapper).toHaveBeenCalledTimes(entities.length);
      expect(paginatedSpy).toHaveBeenCalledWith({
        items: mappedItems,
        total,
        request,
      });
      expect(createSuccessSpy).toHaveBeenCalledWith(paginatedResponse);
      expect(result).toBe(successResponse);
    });

    it('should return failure response when repository returns no records', async () => {
      // Arrange
      const paginationOptions = BasePaginatedHandlerFixture.paginationOptions<TestEntity>();
      const notFoundMessage = BasePaginatedHandlerFixture.notFoundMessage();

      jest.spyOn(PaginateHelper, 'calculateRepositoryPagination').mockReturnValueOnce(
        paginationOptions as never,
      );

      repository.findAndCount.mockResolvedValueOnce([[], 0]);

      const failureResponse = BasePaginatedHandlerFixture.failureResponse();
      const failureSpy = jest.spyOn(handler as any, 'createResponseFailure').mockResolvedValueOnce(failureResponse);

      // Act
      const result = await handler.executeWrapper(repository, request, BasePaginatedHandlerFixture.mapEntityToResponse, notFoundMessage);

      // Assert
      expect(repository.findAndCount).toHaveBeenCalledWith(paginationOptions);
      expect(failureSpy).toHaveBeenCalledWith(notFoundMessage, 404);
      expect(result).toBe(failureResponse);
    });
  });
});
