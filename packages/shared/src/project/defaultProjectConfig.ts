import { ProjectConfig } from '../types';

export const getDefaultProjectConfig = (): ProjectConfig =>
  JSON.parse(JSON.stringify(defaultProjectConfig));

const defaultProjectConfig: Readonly<ProjectConfig> = {
  path: {
    base: '.',
    dictionary: 'src/locales',
    entry: 'src',
    cache: '.i18n',
  },

  locale: {
    basic: 'en',
    others: [],
  },

  syntax: {
    nsDivider: '.',
    keyDivider: '.',
  },

  integration: {
    funcNamePattern: '^(t|\\$t)$',
    hookNamePattern: '^useTranslations$',
    richNamePattern: '^rich$',
  },

  translator: {
    completionOptions: {
      preset: {
        override: false,
      },
    },
    descriptions: {},
  },

  madgeConfig: {
    fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    excludeRegExp: [],
    tsConfig: {
      compilerOptions: {
        paths: {},
      },
    },
  },
};
