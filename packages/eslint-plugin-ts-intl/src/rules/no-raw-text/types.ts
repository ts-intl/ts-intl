import { Rule } from 'eslint';

import { Node } from '../../node';

export type AutoFillOpts = {
  rootDir: string;
  package: string;
  useTranslations: string;
  fallbackNamespace: string;
  tFunction: string;
};

export type FixGetter<T = Node> = (props: {
  fixer: Rule.RuleFixer;
  node: T;
  opts: AutoFillOpts;
  context: Rule.RuleContext;
  preFix?: Rule.Fix;
}) => Rule.Fix | undefined;

export const isAutoFillOpts = (opts: any): opts is AutoFillOpts => {
  return (
    opts &&
    typeof opts === 'object' &&
    typeof opts.rootDir === 'string' &&
    typeof opts.package === 'string' &&
    typeof opts.useTranslations === 'string' &&
    typeof opts.fallbackNamespace === 'string' &&
    typeof opts.tFunction === 'string'
  );
};
