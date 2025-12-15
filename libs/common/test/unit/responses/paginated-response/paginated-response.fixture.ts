export class SampleModel {
  constructor(public value: string) {}
}

export class PaginatedResponseFixture {
  static sampleModel(): SampleModel {
    return new SampleModel('test');
  }

  static sampleModelList(): SampleModel[] {
    return [new SampleModel('item-1'), new SampleModel('item-2')];
  }

  static paginatedData<T>(items: T[]) {
    return {
      items,
      total: 20,
      page: 2,
      take: 5,
      skip: 5,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      filters: { active: true },
      previousPage: 1,
      currentPage: 2,
      nextPage: 3,
    };
  }

  static modelClass(): typeof SampleModel {
    return SampleModel;
  }
}
