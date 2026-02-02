import * as fs from 'fs';
import * as path from 'path';

const i18nDir = path.resolve(__dirname, '../../../src/i18n');

function getLanguageDirs(): string[] {
  return fs
    .readdirSync(i18nDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function getJsonFiles(langDir: string): string[] {
  return fs
    .readdirSync(path.join(i18nDir, langDir))
    .filter((file) => file.endsWith('.json'))
    .sort();
}

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, fullKey);
    }

    return [fullKey];
  });
}

function loadKeys(lang: string, file: string): string[] {
  const filePath = path.join(i18nDir, lang, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
  return flattenKeys(content).sort();
}

describe('i18n translation keys synchronization', () => {
  const languages = getLanguageDirs();

  it('should have at least two languages', () => {
    expect(languages.length).toBeGreaterThanOrEqual(2);
  });

  const referenceLang = languages[0];
  const referenceFiles = getJsonFiles(referenceLang);

  describe.each(languages.filter((lang) => lang !== referenceLang))('language "%s"', (lang) => {
    it('should have the same translation files as the reference language', () => {
      const files = getJsonFiles(lang);
      expect(files).toEqual(referenceFiles);
    });

    describe.each(referenceFiles)('file "%s"', (file) => {
      it('should have the same keys as the reference language', () => {
        const referenceKeys = loadKeys(referenceLang, file);
        const langKeys = loadKeys(lang, file);

        const missingInLang = referenceKeys.filter((key) => !langKeys.includes(key));
        const extraInLang = langKeys.filter((key) => !referenceKeys.includes(key));

        if (missingInLang.length > 0 || extraInLang.length > 0) {
          const messages: string[] = [];

          if (missingInLang.length > 0) {
            messages.push(`Missing in "${lang}/${file}": ${missingInLang.join(', ')}`);
          }
          if (extraInLang.length > 0) {
            messages.push(`Extra in "${lang}/${file}" (not in "${referenceLang}/${file}"): ${extraInLang.join(', ')}`);
          }

          fail(messages.join('\n'));
        }
      });
    });
  });
});
