import { Node } from '../node';
import { createRule, getSchema } from '../utils/eslint';
import { getFunctionName, getNodeName } from '../utils/get';

export const noMismatchT = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow mismatch translation function name',
      category: 'Best Practices',
      recommended: false,
    },
    ...getSchema(['funcNamePattern', 'hookNamePattern']),
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
          !hookNameRegexp.test(getFunctionName(node.init as Node))
        )
          return;
        const funcNameRegexp = new RegExp(funcNamePattern);
        const nodeName = getNodeName(context, node.id as Node);
        if (!funcNameRegexp.test(nodeName)) {
          context.report({
            node: node.id,
            message: `'${nodeName}' mismatch pattern '${funcNamePattern}'`,
          });
        }
      },
    };
  },
});
