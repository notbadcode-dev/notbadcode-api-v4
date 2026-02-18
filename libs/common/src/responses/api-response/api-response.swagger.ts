import { ApiProperty } from '@nestjs/swagger';

import { ApiResponseMessageModel } from './api-response-message';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createApiResponse = <TModel extends abstract new (...args: any[]) => any>(
  model: TModel,
): new () => {
  success: boolean;
  data: InstanceType<TModel>;
  messageList?: ApiResponseMessageModel[];
  code?: string;
} => {
  class ApiResponseWrapper {
    @ApiProperty()
    success!: boolean;

    @ApiProperty({ type: model })
    data!: InstanceType<TModel>;

    @ApiProperty({ type: [ApiResponseMessageModel], required: false })
    messageList?: ApiResponseMessageModel[];

    @ApiProperty({ required: false })
    code?: string;
  }

  return ApiResponseWrapper;
};

export class ApiNullResponse {
  @ApiProperty()
  success!: boolean;

  @ApiProperty({ type: 'null', nullable: true, example: null })
  data!: null;

  @ApiProperty({ type: [ApiResponseMessageModel], required: false })
  messageList?: ApiResponseMessageModel[];

  @ApiProperty({ required: false })
  code?: string;
}

export class ApiFailureResponseModel {
  @ApiProperty({ example: false })
  success!: false;

  @ApiProperty({ type: 'null', nullable: true, example: null, required: false })
  data?: null;

  @ApiProperty({ type: [ApiResponseMessageModel], required: false })
  messageList?: ApiResponseMessageModel[];

  @ApiProperty({ required: false })
  code?: string;
}
