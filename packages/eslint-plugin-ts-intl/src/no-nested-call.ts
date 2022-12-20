import { Rule } from 'eslint';

import { Node } from './node';
import { getFunctionName } from './utils/get';
import { isTargetCallExpression } from './utils/is';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow nested localization function calls',
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
          richNamePattern: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const stack: Node[] = [];
    return {
      CallExpression(node) {
        if (!isTargetCallExpression(context, node)) return;
        if (stack.length) {
          context.report({
            node,
            message: `'${getFunctionName(
              node
            )}' is calling in other '${getFunctionName(
              stack[stack.length - 1]
            )}'`,
          });
        }
        stack.push(node);
      },
      ['CallExpression:exit'](node: Node) {
        if (!isTargetCallExpression(context, node)) return;
        stack.pop();
      },
    };
  },
};

export default rule;
