import { SymbolConstants } from '@common/constants';

export function i18nMsg(key: string, params?: Record<string, string | number>): string {
  if (!params || Object.keys(params).length === 0) {
    return key;
  }
  return `${key}${SymbolConstants.Pipe}${JSON.stringify(params)}`;
}
