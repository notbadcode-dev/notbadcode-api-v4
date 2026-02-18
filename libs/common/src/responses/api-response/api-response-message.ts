import { ApiProperty } from '@nestjs/swagger';

import { EApiResponseMessageType } from './api-response-message-type';

export interface ApiResponseMessage {
  type: EApiResponseMessageType;
  message: string;
}

export class ApiResponseMessageModel {
  @ApiProperty({ enum: EApiResponseMessageType, enumName: 'EApiResponseMessageType' })
  type!: EApiResponseMessageType;

  @ApiProperty()
  message!: string;
}
