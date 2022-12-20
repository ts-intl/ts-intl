import { Rule } from 'eslint';

import noNestedCall from './no-nested-call';

export const rules: Record<string, Rule.RuleModule> = {
  'no-nested-call': noNestedCall,
};
