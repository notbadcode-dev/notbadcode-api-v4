import { type I18nService } from '@common/i18n';
import { ApiResponseConstants, EApiResponseMessageType, type ApiResponseMessage } from '@common/responses';

interface BaseApiResponse {
  success: boolean;
  messageList?: ApiResponseMessage[];
  code?: string;
}

export interface ApiSuccessResponse<T> extends BaseApiResponse {
  success: true;
  data: T;
}

export interface ApiFailureResponse extends BaseApiResponse {
  success: false;
  data?: null;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

const buildApiResponse = async <T>(
  i18nService: I18nService,
  success: boolean,
  messageType: EApiResponseMessageType,
  defaultKey: string,
  data?: T,
  messageList?: ApiResponseMessage[],
  code?: string,
): Promise<ApiResponse<T>> => {
  const translatedMessage = await i18nService.translate(defaultKey);

  const defaultMessageList: ApiResponseMessage[] = [
    {
      message: translatedMessage,
      type: messageType,
    },
  ];

  const translatedMessageList = await Promise.all(
    messageList?.map(async (message: ApiResponseMessage) => ({
      message: await i18nService.translate(message.message),
    })) || defaultMessageList,
  );

  return {
    success,
    data,
    ...(code && { code }),
    messageList: translatedMessageList,
  } as ApiResponse<T>;
};

export const apiResponseSuccess = async <T>(
  i18nService: I18nService,
  data: T,
  messageList?: ApiResponseMessage[],
): Promise<ApiSuccessResponse<T>> =>
  buildApiResponse(
    i18nService,
    true,
    EApiResponseMessageType.Success,
    ApiResponseConstants.defaultApiSuccessResponse,
    data,
    messageList,
  ) as Promise<ApiSuccessResponse<T>>;

export const apiResponseFailure = async (
  i18nService: I18nService,
  messageList?: ApiResponseMessage[],
  code?: string,
): Promise<ApiFailureResponse> =>
  buildApiResponse(
    i18nService,
    false,
    EApiResponseMessageType.Error,
    ApiResponseConstants.defaultApiFailureResponse,
    null,
    messageList,
    code,
  ) as Promise<ApiFailureResponse>;
