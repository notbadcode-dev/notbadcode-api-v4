import { SymbolConstants } from '@common/constants/symbol.constants';
import { i18nMsg } from '@common/helpers';

import { I18nMsgHelperFixture } from './i18nMsg.helper.fixture';

describe('i18nMsg', () => {
  it('returns the key if params is undefined', () => {
    // Arrange
    const key = I18nMsgHelperFixture.testKey;

    // Act
    const result = i18nMsg(key);

    // Assert
    expect(result).toBe(key);
  });

  it('returns the key if params is null', () => {
    // Arrange
    const key = I18nMsgHelperFixture.testKey;
    const params = null as any;

    // Act
    const result = i18nMsg(key, params);

    // Assert
    expect(result).toBe(key);
  });

  it('returns the key if params is an empty object', () => {
    // Arrange
    const key = I18nMsgHelperFixture.testKey;
    const params = I18nMsgHelperFixture.emptyParams;

    // Act
    const result = i18nMsg(key, params);

    // Assert
    expect(result).toBe(key);
  });

  it('returns the key with serialized params when params has values', () => {
    // Arrange
    const key = I18nMsgHelperFixture.testKey;
    const params = I18nMsgHelperFixture.validParams;

    // Act
    const result = i18nMsg(key, params);

    // Assert
    expect(result).toBe(`${key}${SymbolConstants.Pipe}${JSON.stringify(params)}`);
  });
});
