import { type EApiResponseMessageType } from './api-response-message-type';

export interface ApiResponseMessage {
  type: EApiResponseMessageType;
  message: string;
}
