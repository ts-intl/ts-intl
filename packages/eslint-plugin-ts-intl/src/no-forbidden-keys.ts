import { Node } from './node';
import { createRule } from './utils/eslint';
import { getStaticLiteralValue } from './utils/get';
import { isStaticLiteral, isTargetCallExpression } from './utils/is';

export const noForbiddenKeys = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow localization forbidden keys',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          funcNamePattern: {
            type: 'string',
          },
          hookNamePattern: {
            type: 'string',
          },
          forbiddenPattern: {
            type: 'string',
          },
          richNamePattern: {
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
        const { forbiddenPattern = '' } = context.options[0] || {};
        if (!forbiddenPattern) return;
        if (!isTargetCallExpression(context, node)) return;
        if (!isStaticLiteral(node.arguments[0] as Node)) return;
        const forbiddenRegexp = new RegExp(forbiddenPattern);
        const key = getStaticLiteralValue(node.arguments[0] as Node);
        if (forbiddenRegexp.test(key)) {
          context.report({
            node,
            message: `'${key}' using forbidden char '${forbiddenPattern}'`,
          });
        }
      },
    };
  },
});
