import type { IntlLanguageConfig } from './types';

export class IntlUtilsBase {
  public languages: string[];

  constructor(public config: IntlLanguageConfig) {
    this.languages = [config.defaultLanguage, ...config.otherLanguages];
  }

  isLanguageValid = (target?: string) =>
    !!target && this.languages.includes(target);

  getLanguageWithFallback = (target?: string) =>
    this.isLanguageValid(target) ? target : this.config.defaultLanguage;
}
