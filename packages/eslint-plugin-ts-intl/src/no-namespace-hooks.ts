import { createRule } from './utils/eslint';
import { getFunctionName } from './utils/get';

export const noNamespaceHooks = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow localization hook call with namespace',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          hookNamePattern: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    return {
      CallExpression(node) {
        const { hookNamePattern = '' } = context.options[0] || {};
        if (!hookNamePattern) return;
        const chainCallFuncNameRegexp = new RegExp(hookNamePattern);
        const hookName = getFunctionName(node);
        if (!chainCallFuncNameRegexp.test(hookName)) return;
        if (node.arguments[0]) {
          context.report({
            node,
            message: 'namespace used in hook',
            fix(fixer) {
              return fixer.remove(node.arguments[0]);
            },
          });
        }
      },
    };
  },
});
