import { Project } from '@ts-intl/shared';

export const getDefaultRule = (rootDir: string) => {
  const { projectConfig } = Project.getSingleton(rootDir);
  return {
    plugins: ['@ts-intl/eslint-plugin-ts-intl'],
    extends: ['plugin:jsonc/recommended-with-json'],
    rules: {
      '@ts-intl/ts-intl/no-dynamic-keys': ['error', projectConfig.integration],
      '@ts-intl/ts-intl/no-nested-call': ['error', projectConfig.integration],
      '@ts-intl/ts-intl/no-invalid-keys': [
        'error',
        {
          localePath: projectConfig.path.dictionary,
          locale: projectConfig.locale.basic,
          fallbackNamespace: 'common',
          ...projectConfig.integration,
          ...projectConfig.syntax,
        },
      ],
      '@ts-intl/ts-intl/no-namespace-hooks': [
        'error',
        {
          hookNamePattern: projectConfig.integration.hookNamePattern,
        },
      ],
      '@ts-intl/ts-intl/syntax-icu-ts': [
        'error',
        {
          localePath: projectConfig.path.dictionary,
          locale: projectConfig.locale.basic,
          ...projectConfig.integration,
          ...projectConfig.syntax,
        },
      ],
      '@ts-intl/ts-intl/no-mismatch-t': [
        'error',
        {
          funcNamePattern: projectConfig.integration.funcNamePattern,
          hookNamePattern: projectConfig.integration.hookNamePattern,
        },
      ],
    },
    overrides: [
      {
        files: ['*.json', '*.json5'],
        parser: 'jsonc-eslint-parser',
        parserOptions: {
          jsonSyntax: 'JSON',
        },
        rules: {
          '@ts-intl/ts-intl/syntax-icu-json': [
            'error',
            {
              localePath: projectConfig.path.dictionary,
              locale: projectConfig.locale.basic,
              forbiddenPattern: `[${projectConfig.syntax.nsDivider}${projectConfig.syntax.keyDivider}]`,
            },
          ],
          '@ts-intl/ts-intl/no-missing-keys-in-other-locales': [
            'warn',
            {
              localePath: projectConfig.path.dictionary,
              locale: projectConfig.locale.basic,
              others: projectConfig.locale.others,
              ...projectConfig.syntax,
            },
          ],
          'max-lines': [
            'error',
            {
              max: 600,
              skipBlankLines: true,
              skipComments: false,
            },
          ],
        },
      },
    ],
  };
};
