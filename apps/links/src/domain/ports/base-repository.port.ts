import { type FindOneOptions, type FindOptionsOrder, type FindOptionsWhere } from 'typeorm';

export interface IBaseRepository<T> {
  findOne(options: FindOneOptions<T>): Promise<T | null>;
  findAndCount(options: {
    skip: number;
    take: number;
    order?: FindOptionsOrder<T>;
    where?: FindOptionsWhere<T>;
    relations?: string[];
  }): Promise<[T[], number]>;
  find(options: { select?: (keyof T)[]; where: FindOptionsWhere<T> }): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(criteria: FindOptionsWhere<T>, data: Partial<T>): Promise<{ affected?: number }>;
}
