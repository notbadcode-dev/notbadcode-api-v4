import { Injectable } from '@nestjs/common';
import { I18nService as NestI18nService, TranslateOptions } from 'nestjs-i18n';

@Injectable()
export class I18nService {
  constructor(private readonly i18n: NestI18nService) {}

  async translate(key: string, options?: TranslateOptions): Promise<string> {
    if (!key) {
      return '';
    }

    try {
      if (!options) {
        return await this.i18n.t(key);
      }

      return await this.i18n.t(key, options);
    } catch {
      return '';
    }
  }
}
