import { SymbolConstants } from '@common/constants';

export function i18nMsg(key: string, params?: Record<string, string | number>): string {
  let result = key;

  if (params != null) {
    const hasValues = Object.keys(params).length > 0;

    if (hasValues) {
      result = `${key}${SymbolConstants.Pipe}${JSON.stringify(params)}`;
    }
  }

  return result;
}
