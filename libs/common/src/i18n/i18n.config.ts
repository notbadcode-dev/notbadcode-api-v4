import { join } from 'path';

import { AcceptLanguageResolver, HeaderResolver, I18nJsonLoader, QueryResolver } from 'nestjs-i18n';
import { type I18nOptions } from 'nestjs-i18n/dist/interfaces/i18n-options.interface';

import { CommonConstants, I18nConstants } from '@common/constants';

const i18nPath = process.env.I18N_DIR || join(__dirname, CommonConstants.i18nFolderName);

export const i18nConfig: I18nOptions = {
  fallbackLanguage: I18nConstants.defaultLanguage,
  loader: I18nJsonLoader,
  loaderOptions: {
    path: i18nPath,
    watch: process.env.NODE_ENV !== CommonConstants.productionEnvironmentTag,
  },
  resolvers: [
    new QueryResolver([I18nConstants.queryResolverParameter]),
    new HeaderResolver([I18nConstants.headerResolverKey]),
    AcceptLanguageResolver,
  ],
};
