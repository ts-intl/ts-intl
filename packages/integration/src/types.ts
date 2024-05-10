import type { Dictionary } from '@ts-intl/shared';
import type { ParsedUrlQueryInput } from 'querystring';

export interface IntlLanguageConfig {
  defaultLanguage: string;
  otherLanguages: string[];
  languageParamName: string;
}

export interface IntlProviderProps {
  dictionary: Dictionary;
  currentLanguage: string;
  defaultLanguage: string;
}

/**
 * should always be page path!
 */
export type IntlInternalUrl =
  | {
      pathname: string;
      query?: ParsedUrlQueryInput;
    }
  | string;
