import { Injectable } from '@nestjs/common';
import { I18nService as NestI18nService, TranslateOptions } from 'nestjs-i18n';

@Injectable()
export class I18nService {
  constructor(private readonly i18n: NestI18nService) {}

  async translate(key: string, options?: TranslateOptions): Promise<string> {
    return this.i18n.t(key, options);
  }

  async translateWithArguments(
    key: string,
    args: Record<string, string | number>,
    options?: Omit<TranslateOptions, 'args'>,
  ): Promise<string> {
    return this.i18n.t(key, { ...(options ?? {}), args });
  }
}
