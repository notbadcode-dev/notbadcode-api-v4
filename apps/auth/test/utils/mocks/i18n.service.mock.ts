import { I18nService } from 'nestjs-i18n';

export class I18nServiceMock extends I18nService {
  override i18n = {};
  override safeTranslate = jest.fn();

  override t = jest.fn();
  override translate = jest.fn();
  override instant = jest.fn();
  override validate = jest.fn();
  override getSupportedLanguages = jest.fn();
  override getTranslations = jest.fn();
  override refresh = jest.fn();
  override onModuleDestroy = jest.fn();
}
