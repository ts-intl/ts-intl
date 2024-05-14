const { getDefaultRule, getNoRawRule } = require('@ts-intl/integration');
const { resolve } = require('path');

const rootDir = resolve(__dirname);
const defaultRule = getDefaultRule(rootDir);
const noRawRule = getNoRawRule(
  { rootDir, entry: '\\/src' },
  {
    autoFill: {
      package: './useTranslations',
      useTranslations: 'useTranslations',
      fallbackNamespace: 'common',
      tFunction: 't',
    },
  },
);

module.exports = {
  plugins: defaultRule.plugins,
  extends: defaultRule.extends,
  rules: {
    ...defaultRule.rules,
    ...noRawRule.rules,
  },
  overrides: defaultRule.overrides,
};
