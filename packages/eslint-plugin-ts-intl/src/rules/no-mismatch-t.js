const { isStaticLiteral, isTargetCallExpression } = require('./utils/is');
const { getFunctionName, getNodeName } = require('./utils/get');

module.exports = {
  name: 'no-mismatch-t',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow mismatch translation function name',
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
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    return {
      VariableDeclarator(node) {
        const { funcNamePattern = '', hookNamePattern = '' } =
          context.options[0] || {};
        const hookNameRegexp = new RegExp(hookNamePattern);
        if (
          !node.init ||
          node.init.type !== 'CallExpression' ||
          !hookNameRegexp.test(getFunctionName(node.init))
        )
          return;
        const funcNameRegexp = new RegExp(funcNamePattern);
        const nodeName = getNodeName(context, node.id);
        if (!funcNameRegexp.test(nodeName)) {
          context.report({
            node: node.id,
            message: `'${nodeName}' mismatch pattern '${funcNamePattern}'`,
          });
        }
      },
    };
  },
};
