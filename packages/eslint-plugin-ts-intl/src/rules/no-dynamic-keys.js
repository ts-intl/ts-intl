const { isStaticLiteral, isTargetCallExpression } = require('./utils/is');
const { getNodeName } = require('./utils/get');

module.exports = {
  name: 'no-dynamic-keys',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow localization dynamic keys at localization methods',
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
    return {
      CallExpression(node) {
        if (!isTargetCallExpression(context, node)) return;
        if (isStaticLiteral(node.arguments[0])) return;
        context.report({
          node,
          message: `'${getNodeName(
            context,
            node.arguments[0]
          )}' dynamic key is used'`,
        });
      },
    };
  },
};
