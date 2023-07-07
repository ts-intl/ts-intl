const { Project } = require('@ts-intl/shared');

const { projectConfig } = Project.getSingleton();

module.exports = {
  plugins: ['@ts-intl/eslint-plugin-ts-intl'],
  rules: {
    '@ts-intl/ts-intl/no-dynamic-keys': [
      'error',
      {
        funcNamePattern: projectConfig.integration.funcNamePattern,
        hookNamePattern: projectConfig.integration.hookNamePattern,
        richNamePattern: projectConfig.integration.richNamePattern,
      },
    ],
    '@ts-intl/ts-intl/no-nested-call': [
      'error',
      {
        funcNamePattern: projectConfig.integration.funcNamePattern,
        hookNamePattern: projectConfig.integration.hookNamePattern,
        richNamePattern: projectConfig.integration.richNamePattern,
      },
    ],
    '@ts-intl/ts-intl/no-invalid-keys': [
      'error',
      {
        fallbackNamespace: 'common',
        funcNamePattern: projectConfig.integration.funcNamePattern,
        hookNamePattern: projectConfig.integration.hookNamePattern,
        richNamePattern: projectConfig.integration.richNamePattern,
        namespaceDivider: projectConfig.syntax.nsDivider,
        keyDivider: projectConfig.syntax.keyDivider,
        localePath: projectConfig.path.dictionary,
        locale: projectConfig.locale.basic,
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
        funcNamePattern: projectConfig.integration.funcNamePattern,
        hookNamePattern: projectConfig.integration.hookNamePattern,
        richNamePattern: projectConfig.integration.richNamePattern,
        namespaceDivider: projectConfig.syntax.nsDivider,
        keyDivider: projectConfig.syntax.keyDivider,
        localePath: projectConfig.path.dictionary,
        locale: projectConfig.locale.basic,
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
            otherLocales: projectConfig.locale.others,
            namespaceDivider: projectConfig.syntax.nsDivider,
            keyDivider: projectConfig.syntax.keyDivider,
          },
        ],
      },
    },
  ],
};
