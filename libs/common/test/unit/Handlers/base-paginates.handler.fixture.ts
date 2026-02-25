import { type ObjectLiteral } from 'typeorm';

import { type I18nService } from '@common/i18n';
import { type PaginatedRequest } from '@common/requests';
import { type ApiResponse, type PaginatedResponse } from '@common/responses';

export interface TestEntity extends ObjectLiteral {
  id: number;
  title: string;
}

export interface TestResponseDto {
  id: number;
  label: string;
}

export class BasePaginatedHandlerFixture {
  static request(): PaginatedRequest {
    return {
       
      currentPage: 2,
       
      take: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    } as PaginatedRequest;
  }

  static entities(): TestEntity[] {
    return [
      {
        id: 1,
        title: 'first',
      },
      {
         
        id: 2,
        title: 'second',
      },
    ];
  }

  static mapEntityToResponse(entity: TestEntity): TestResponseDto {
    return {
      id: entity.id,
      label: entity.title.toUpperCase(),
    };
  }

  static paginatedResponse(items: TestResponseDto[]): PaginatedResponse<TestResponseDto> {
    return {
      items,
       
      total: 50,
       
      take: 10,
       
      skip: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };
  }

  static successResponse(data: PaginatedResponse<TestResponseDto>): ApiResponse<PaginatedResponse<TestResponseDto>> {
    return {
      success: true,
      data,
      messageList: [],
    };
  }

  static failureResponse(): ApiResponse<PaginatedResponse<TestResponseDto>> {
    return {
      success: false,
      data: null,
      messageList: [],
    };
  }

  static paginationOptions(): {
    skip: number;
    take: number;
    order: Record<string, unknown>;
  } {
    return {
       
      skip: 10,
       
      take: 10,
      order: {
        createdAt: 'DESC',
      },
    };
  }

  static notFoundMessage(): string {
    return 'links.notFound';
  }

  static i18nStub(): I18nService {
    return {
      translate: async () => '',
    } as unknown as I18nService;
  }
}
