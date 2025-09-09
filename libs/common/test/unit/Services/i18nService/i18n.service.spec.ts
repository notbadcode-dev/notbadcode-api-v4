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

  it('can be constructed', () => {
    expect(() => new I18nService(mockNestI18nService as any)).not.toThrow();
  });

  it('should call i18n.t with key and options in translate', async () => {
    // Arrange
    mockNestI18nService.t.mockResolvedValue(I18nServiceFixture.translatedSimple);

    // Act
    const result = await i18nService.translate(
      I18nServiceFixture.keySimple,
      I18nServiceFixture.simpleOptions,
    );

    // Assert
    expect(mockNestI18nService.t).toHaveBeenCalledWith(
      I18nServiceFixture.keySimple,
      I18nServiceFixture.simpleOptions,
    );
    expect(result).toBe(I18nServiceFixture.translatedSimple);
  });

  it('should call i18n.t with key and merged options in translateWithArguments', async () => {
    // Arrange
    mockNestI18nService.t.mockResolvedValue(I18nServiceFixture.translatedWithArgs);

    // Act
    const result = await i18nService.translateWithArguments(
      I18nServiceFixture.keyWithArgs,
      I18nServiceFixture.args,
      I18nServiceFixture.withArgsOptions,
    );

    // Assert
    expect(mockNestI18nService.t).toHaveBeenCalledWith(
      I18nServiceFixture.keyWithArgs,
      I18nServiceFixture.expectedMergedOptions,
    );
    expect(result).toBe(I18nServiceFixture.translatedWithArgs);
  });

  it('should call i18n.t with key and only args if options is undefined in translateWithArguments', async () => {
    // Arrange
    mockNestI18nService.t.mockResolvedValue(I18nServiceFixture.translatedOnlyArgs);

    // Act
    const result = await i18nService.translateWithArguments(
      I18nServiceFixture.keyOnlyArgs,
      I18nServiceFixture.onlyArgs,
    );

    // Assert
    expect(mockNestI18nService.t).toHaveBeenCalledWith(I18nServiceFixture.keyOnlyArgs, {
      args: I18nServiceFixture.onlyArgs,
    });
    expect(result).toBe(I18nServiceFixture.translatedOnlyArgs);
  });
});
