import { ApiFailureResponseModel, ApiNullResponse, createApiResponse, EApiResponseMessageType } from '@common/responses';

class SampleSwaggerModel {
  id!: number;
}

describe('api-response.swagger', () => {
  it('creates wrapper response class for model', () => {
    const Wrapper = createApiResponse(SampleSwaggerModel);
    const response = new Wrapper();
    response.success = true;
    response.data = { id: 10 } as SampleSwaggerModel;
    response.messageList = [{ type: EApiResponseMessageType.Success, message: 'ok' }];
    response.code = 'OK';

    expect(response.success).toBe(true);
    expect(response.data.id).toBe(10);
    expect(response.messageList?.[0]?.message).toBe('ok');
    expect(response.code).toBe('OK');
  });

  it('supports ApiNullResponse and ApiFailureResponseModel contracts', () => {
    const nullResponse = new ApiNullResponse();
    nullResponse.success = true;
    nullResponse.data = null;
    nullResponse.messageList = [{ type: EApiResponseMessageType.Info, message: 'empty' }];
    nullResponse.code = 'EMPTY';

    const failure = new ApiFailureResponseModel();
    failure.success = false;
    failure.data = null;
    failure.messageList = [{ type: EApiResponseMessageType.Error, message: 'error' }];
    failure.code = 'ERR';

    expect(nullResponse.data).toBeNull();
    expect(nullResponse.code).toBe('EMPTY');
    expect(failure.success).toBe(false);
    expect(failure.messageList?.[0]?.message).toBe('error');
  });
});
