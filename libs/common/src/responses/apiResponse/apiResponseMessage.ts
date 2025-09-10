import { type EApiResponseMessageType } from './apiResponseMessageType';

export interface ApiResponseMessage {
  type: EApiResponseMessageType;
  message: string;
}
