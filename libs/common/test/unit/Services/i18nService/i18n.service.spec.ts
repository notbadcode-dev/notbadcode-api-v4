// i18n.service.spec.ts
import { I18nService } from '@common/i18n';

import { I18nServiceFixture } from './i18n.service.fixture';

describe('I18nService', () => {
  let i18nService: I18nService;
  let mockNestI18nService: { t: jest.Mock };

  beforeEach(() => {
    mockNestI18nService = I18nServiceFixture.makeNestI18nMock();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    i18nService = new I18nService(mockNestI18nService as any);
  });

  it('should call i18n.t with key and options in translate', async () => {
    mockNestI18nService.t.mockResolvedValue(I18nServiceFixture.translatedSimple);

    const result = await i18nService.translate(
      I18nServiceFixture.keySimple,
      I18nServiceFixture.simpleOptions,
    );

    expect(mockNestI18nService.t).toHaveBeenCalledWith(
      I18nServiceFixture.keySimple,
      I18nServiceFixture.simpleOptions,
    );
    expect(result).toBe(I18nServiceFixture.translatedSimple);
  });

  it('should call i18n.t with key and merged options in translateWithArguments', async () => {
    mockNestI18nService.t.mockResolvedValue(I18nServiceFixture.translatedWithArgs);

    const result = await i18nService.translateWithArguments(
      I18nServiceFixture.keyWithArgs,
      I18nServiceFixture.args,
      I18nServiceFixture.withArgsOptions,
    );

    expect(mockNestI18nService.t).toHaveBeenCalledWith(
      I18nServiceFixture.keyWithArgs,
      I18nServiceFixture.expectedMergedOptions,
    );
    expect(result).toBe(I18nServiceFixture.translatedWithArgs);
  });

  it('should call i18n.t with key and only args if options is undefined in translateWithArguments', async () => {
    mockNestI18nService.t.mockResolvedValue(I18nServiceFixture.translatedOnlyArgs);

    const result = await i18nService.translateWithArguments(
      I18nServiceFixture.keyOnlyArgs,
      I18nServiceFixture.onlyArgs,
    );

    expect(mockNestI18nService.t).toHaveBeenCalledWith(I18nServiceFixture.keyOnlyArgs, {
      args: I18nServiceFixture.onlyArgs,
    });
    expect(result).toBe(I18nServiceFixture.translatedOnlyArgs);
  });
});
