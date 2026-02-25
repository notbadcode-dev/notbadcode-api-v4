 
/* eslint-disable no-restricted-syntax */
import { SymbolConstants } from '@common/constants';

export class I18nMsgHelperFixture {
  static testKey = 'test.key';

  static emptyParams = {};

  static validParams = {
    foo: 'bar',
    num: 42,
  };

  static expectedWithParams = `${I18nMsgHelperFixture.testKey}${SymbolConstants.Pipe}${JSON.stringify(
    I18nMsgHelperFixture.validParams,
  )}`;
}
