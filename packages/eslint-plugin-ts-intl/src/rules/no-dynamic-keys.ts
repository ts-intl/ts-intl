import { Node } from '../node';
import { createRule, getSchema } from '../utils/eslint';
import { getNodeName } from '../utils/get';
import { isStaticLiteral, isTargetCallExpression } from '../utils/is';

export const noDynamicKeys = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow localization dynamic keys at localization methods',
      category: 'Best Practices',
      recommended: false,
    },
    ...getSchema(['funcNamePattern', 'hookNamePattern', 'richNamePattern']),
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isTargetCallExpression(context, node)) return;
        if (isStaticLiteral(node.arguments[0] as Node)) return;
        context.report({
          node,
          message: `'${getNodeName(
            context,
            node.arguments[0] as Node
          )}' dynamic key is used'`,
        });
      },
    };
  },
});
