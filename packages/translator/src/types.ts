import { ChatCompletionRequestMessage } from 'openai';

export type ProjectConfig = {
  path: string;
  basicLanguage: string;
  languages: string[];
  nsDivider: string;
  keyDivider: string;
  syntax: 'icu';

  completionOptions?: {
    preset?: {
      override?: boolean;
      presets?: ChatCompletionRequestMessage[];
    };
  };

  descriptions: Record<string, string | undefined>;
};

export type TranslateNeeded = {
  path: string;
  originalContent: string;
};

export type Translated = {
  path: string;
  content: string;
};

export type CompletionMsg = {
  locale: string;
  content: string;
  description?: string;
};

export type CompletionRes = {
  translation: string;
  note?: string;
};
