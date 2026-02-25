import { BaseHandler } from '@common/handler/base.handler';
import { type I18nService } from '@common/i18n';
import { type ApiSuccessResponse } from '@common/responses';

class TestBaseHandler extends BaseHandler<{ input: string }, ApiSuccessResponse<{ ok: boolean }>> {
  async execute(_command: { input: string }): Promise<ApiSuccessResponse<{ ok: boolean }>> {
    void _command;
    return this.createSuccessResponse({ ok: true });
  }

  async fail(message: string, status?: number, code?: string) {
    return this.createResponseFailure(message, status, code);
  }
}

describe('BaseHandler', () => {
  let i18nService: I18nService;
  let handler: TestBaseHandler;

  beforeEach(() => {
    i18nService = {
      translate: jest.fn(async (key: string) => key),

      t: jest.fn(async (key: string) => key),
    } as unknown as I18nService;
    handler = new TestBaseHandler(i18nService);
  });

  it('creates success response', async () => {
    const result = await handler.execute({ input: 'x' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ ok: true });
  });

  it('creates failure response without code', async () => {
    const result = await handler.fail('test.error');
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.code).toBeUndefined();
    expect(result.messageList?.[0]?.message).toBe('test.error');
  });

  it('creates failure response with code', async () => {
    const result = await handler.fail('test.error', 400, 'E_TEST');
    expect(result.success).toBe(false);
    expect(result.code).toBe('E_TEST');
    expect(result.messageList?.[0]?.message).toBe('test.error');
  });
});
