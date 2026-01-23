import { IsArray } from 'class-validator';

export class SuccessFailureResponse<T> {
  @IsArray()
  successList!: T[];

  @IsArray()
  failureList!: T[];
}
