const { getFunctionName } = require('./utils/get');
const { isTargetCallExpression } = require('./utils/is');

module.exports = {
  name: 'no-nested-call',
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow nested localization function calls',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: null,
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
    const stack = [];
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
      ['CallExpression:exit'](node) {
        if (!isTargetCallExpression(context, node)) return;
        stack.pop();
      },
    };
  },
};
