const { isStaticLiteral, isTargetCallExpression } = require('./utils/is');
const { getStaticLiteralValue } = require('./utils/get');

module.exports = {
  name: 'no-forbidden-keys',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow localization forbidden keys',
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
        if (!isStaticLiteral(node.arguments[0])) return;
        const forbiddenRegexp = new RegExp(forbiddenPattern);
        const key = getStaticLiteralValue(node.arguments[0]);
        if (forbiddenRegexp.test(key)) {
          context.report({
            node,
            message: `'${key}' using forbidden char '${forbiddenPattern}'`,
          });
        }
      },
    };
  },
};
