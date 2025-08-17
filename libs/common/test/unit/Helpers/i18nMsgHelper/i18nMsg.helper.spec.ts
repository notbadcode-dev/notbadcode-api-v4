import { i18nMsg } from '@common/helpers';

import { I18nMsgHelperFixture } from './i18nMsg.helper.fixture';

describe('i18nMsg', () => {
  it('returns the key if params is undefined', () => {
    expect(i18nMsg(I18nMsgHelperFixture.testKey)).toBe(I18nMsgHelperFixture.testKey);
  });

  it('returns the key if params is an empty object', () => {
    expect(i18nMsg(I18nMsgHelperFixture.testKey, I18nMsgHelperFixture.emptyParams)).toBe(
      I18nMsgHelperFixture.testKey,
    );
  });

  it('returns the key and serialized params if params has values', () => {
    expect(i18nMsg(I18nMsgHelperFixture.testKey, I18nMsgHelperFixture.validParams)).toBe(
      I18nMsgHelperFixture.expectedWithParams,
    );
  });
});
