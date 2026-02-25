import { Injectable, Logger } from '@nestjs/common';
import { I18nContext, I18nService as NestI18nService, TranslateOptions } from 'nestjs-i18n';

@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);

  constructor(private readonly i18n: NestI18nService) {}

  async translate(key: string, options?: TranslateOptions): Promise<string> {
    if (!key) {
      return '';
    }

    try {
      const lang = options?.lang || I18nContext.current()?.lang;
      return await this.i18n.t(key, { ...options, lang });
    } catch (error) {
      this.logger.warn(`Failed to translate key "${key}": ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }
}
