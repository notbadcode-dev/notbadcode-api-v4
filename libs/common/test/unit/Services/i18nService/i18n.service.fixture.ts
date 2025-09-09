/* eslint-disable @typescript-eslint/no-magic-numbers */
import { type TranslateOptions } from 'nestjs-i18n';

type NestI18nMock = {
  t: jest.Mock<Promise<string>, [string, TranslateOptions?]>;
};

export class I18nServiceFixture {
  static readonly simpleKey = 'common.hello';
  static readonly keyWithArguments = 'common.hello.name';
  static readonly keyOnlyArguments = 'common.onlyArgs';

  static readonly keySimple = I18nServiceFixture.simpleKey;
  static readonly keyWithArgs = I18nServiceFixture.keyWithArguments;
  static readonly keyOnlyArgs = I18nServiceFixture.keyOnlyArguments;

  static readonly simpleOptions: TranslateOptions = { lang: 'en' };
  static readonly withArgumentsOptions: TranslateOptions = { lang: 'en', defaultValue: 'Hello' };
  static readonly withArgsOptions = I18nServiceFixture.withArgumentsOptions;

  static readonly args = { name: 'Charles', age: 37 } as const;
  static readonly onlyArguments = { value: 123 } as const;
  static readonly onlyArgs = I18nServiceFixture.onlyArguments;

  static readonly expectedMergedOptions: TranslateOptions = {
    ...I18nServiceFixture.withArgumentsOptions,
    args: I18nServiceFixture.args,
  };

  static readonly translatedSimple = 'translated';
  static readonly translatedWithArguments = 'with arguments';
  static readonly translatedWithArgs = I18nServiceFixture.translatedWithArguments;
  static readonly translatedOnlyArguments = 'with only arguments';
  static readonly translatedOnlyArgs = I18nServiceFixture.translatedOnlyArguments;

  static makeNestI18nMock(): NestI18nMock {
    return {
      t: jest.fn<Promise<string>, [string, TranslateOptions?]>(),
    };
  }
}
