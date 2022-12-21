import { Rule } from 'eslint';

import { icuJsonStyle } from './icu-json-style';
import { noDynamicKeys } from './no-dynamic-keys';
import { noForbiddenKeys } from './no-forbidden-keys';
import { noMismatchT } from './no-mismatch-t';
import { noNamespaceHooks } from './no-namespace-hooks';
import { noNestedCall } from './no-nested-call';

export const rules: Record<string, Rule.RuleModule> = {
  'no-nested-call': noNestedCall,
  'no-namespace-hooks': noNamespaceHooks,
  'no-mismatch-t': noMismatchT,
  'no-dynamic-keys': noDynamicKeys,
  'no-forbidden-keys': noForbiddenKeys,
  'icu-json-style': icuJsonStyle,
};
