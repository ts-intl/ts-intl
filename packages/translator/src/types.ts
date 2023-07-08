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
