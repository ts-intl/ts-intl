import { Rule } from 'eslint';

import { noDynamicKeys } from './no-dynamic-keys';
import { noForbiddenKeys } from './no-forbidden-keys';
import { noInvalidKeys } from './no-invalid-keys';
import { noMismatchT } from './no-mismatch-t';
import { noMissingKeysInOtherLocales } from './no-missing-keys-in-other-locales';
import { noNamespaceHooks } from './no-namespace-hooks';
import { noNestedCall } from './no-nested-call';
import { noRawText } from './no-raw-text';
import { syntaxIcuJson } from './syntax-icu-json';
import { syntaxIcuTs } from './syntax-icu-ts';

export const rules: Record<string, Rule.RuleModule> = {
  'no-nested-call': noNestedCall,
  'no-namespace-hooks': noNamespaceHooks,
  'no-mismatch-t': noMismatchT,
  'no-dynamic-keys': noDynamicKeys,
  'no-forbidden-keys': noForbiddenKeys,
  'syntax-icu-json': syntaxIcuJson,
  'no-invalid-keys': noInvalidKeys,
  'syntax-icu-ts': syntaxIcuTs,
  'no-missing-keys-in-other-locales': noMissingKeysInOtherLocales,
  'no-raw-text': noRawText,
};
