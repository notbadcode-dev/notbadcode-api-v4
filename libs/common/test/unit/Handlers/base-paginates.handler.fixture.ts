import { type ObjectLiteral } from 'typeorm';

import { type I18nService } from '@common/i18n';
import { type UserPaginatedRequest } from '@common/requests';
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
  static request(): UserPaginatedRequest {
    return {
      userId: 1,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      currentPage: 2,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      take: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    } as UserPaginatedRequest;
  }

  static entities(): TestEntity[] {
    return [
      {
        id: 1,
        title: 'first',
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
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
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      total: 50,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      page: 2,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      take: 10,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
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
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      skip: 10,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
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
