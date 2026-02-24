import { type I18nService } from '@common/i18n';
import { type ApiFailureResponse, apiResponseFailure, apiResponseSuccess, type ApiSuccessResponse, EApiResponseMessageType } from '@common/responses';

export abstract class BaseHandler<TCommand, TResult> {
  constructor(protected readonly i18nService: I18nService) {}

  abstract execute(command: TCommand): Promise<TResult>;

  protected async createResponseFailure(
    message: string,
    status?: number,
    code?: string,
  ): Promise<ApiFailureResponse> {
    void status;
    if (code === undefined) {
      return await apiResponseFailure(this.i18nService, [{ type: EApiResponseMessageType.Error, message }]);
    }
    return await apiResponseFailure(this.i18nService, [{ type: EApiResponseMessageType.Error, message }], code);
  }

  protected async createSuccessResponse<TResult>(tokens: TResult): Promise<ApiSuccessResponse<TResult>> {
    return await apiResponseSuccess(this.i18nService, tokens);
  }
}
