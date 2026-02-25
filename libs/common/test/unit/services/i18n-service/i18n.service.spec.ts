import { I18nService } from '@common/i18n';

import { I18nServiceFixture } from './i18n.service.fixture';

/* istanbul ignore file */
describe('I18nService', () => {
  let i18nService: I18nService;
  let mockNestI18nService: { t: jest.Mock };

  beforeEach(() => {
    mockNestI18nService = I18nServiceFixture.makeNestI18nMock();
     
    i18nService = new I18nService(mockNestI18nService as any);
  });

  it('can be constructed', () => {
    // Arrange
     
    const factory = () => new I18nService(mockNestI18nService as any);

    // Act & Assert
    expect(factory).not.toThrow();
  });

  it('returns empty string when key is empty', async () => {
    // Arrange
    mockNestI18nService.t.mockResolvedValue('SHOULD_NOT_BE_USED');

    // Act
    const result = await i18nService.translate('');

    // Assert
    expect(mockNestI18nService.t).not.toHaveBeenCalled();
    expect(result).toBe('');
  });

  it('calls i18n.t(key) when options is null', async () => {
    // Arrange
    mockNestI18nService.t.mockResolvedValue(I18nServiceFixture.translatedSimple);

    // Act
    const result = await i18nService.translate(I18nServiceFixture.keySimple, null!);

    // Assert
    expect(mockNestI18nService.t).toHaveBeenCalledWith(I18nServiceFixture.keySimple);
    expect(result).toBe(I18nServiceFixture.translatedSimple);
  });

  it('calls i18n.t(key) when options is undefined', async () => {
    // Arrange
    mockNestI18nService.t.mockResolvedValue(I18nServiceFixture.translatedSimple);

    // Act
    const result = await i18nService.translate(I18nServiceFixture.keySimple, undefined);

    // Assert
    expect(mockNestI18nService.t).toHaveBeenCalledWith(I18nServiceFixture.keySimple);
    expect(result).toBe(I18nServiceFixture.translatedSimple);
  });

it('calls i18n.t(key, options) when options is provided', async () => {
  // Arrange
  mockNestI18nService.t.mockResolvedValue(I18nServiceFixture.translatedSimple);

  // Act
  const result = await i18nService.translate(I18nServiceFixture.keySimple, I18nServiceFixture.simpleOptions);

  // Assert
  expect(mockNestI18nService.t).toHaveBeenCalledWith(I18nServiceFixture.keySimple, I18nServiceFixture.simpleOptions);
  expect(result).toBe(I18nServiceFixture.translatedSimple);
});

  it('returns empty string when i18n.t throws', async () => {
    // Arrange
    mockNestI18nService.t.mockRejectedValue(new Error('boom'));

    // Act
    const result = await i18nService.translate(I18nServiceFixture.keySimple, I18nServiceFixture.simpleOptions);

    // Assert
    expect(result).toBe('');
  });
});
