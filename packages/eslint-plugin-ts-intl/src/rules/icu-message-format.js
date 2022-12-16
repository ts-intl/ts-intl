const { isStaticLiteral, isTargetCallExpression } = require('./utils/is');
const { getStaticLiteralValue, getFunctionName } = require('./utils/get');
const { collectVariableNodes } = require('./utils/icu');
const { LocaleMessages } = require('./utils/messages');

module.exports = {
  name: 'icu-message-format',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow not icu style keys',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          fullPath: {
            type: 'string',
          },
          locale: {
            type: 'string',
          },
          funcNamePattern: {
            type: 'string',
          },
          hookNamePattern: {
            type: 'string',
          },
          namespaceDivider: {
            type: 'string',
          },
          keyDivider: {
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
        const {
          fullPath,
          locale,
          keyDivider,
          namespaceDivider,
          richNamePattern,
        } = context.options[0] || {};
        if (!isTargetCallExpression(context, node)) return;
        if (!isStaticLiteral(node.arguments[0])) return;
        const localeMessages = LocaleMessages.getSingleton(fullPath, locale);
        const key = getStaticLiteralValue(node.arguments[0]);
        const { code, msg = '' } = localeMessages.hasPath(
          key,
          namespaceDivider,
          keyDivider
        );
        if (code !== 0) return;
        const nodeMap = collectVariableNodes(msg);
        if (!Object.keys(nodeMap).length) {
          if (node.arguments[1]) {
            context.report({
              node: node.arguments[1],
              message: `should not provide parameters`,
            });
          }
          return;
        }
        if (
          !node.arguments[1] ||
          node.arguments[1].type !== 'ObjectExpression'
        ) {
          context.report({
            node: node.arguments[1] || node,
            message: `should provide parameters ${JSON.stringify(nodeMap)}`,
          });
          return;
        }

        const visit = {};
        for (let p of node.arguments[1].properties) {
          if (!p.key || p.key.type !== 'Identifier') {
            context.report({
              node: p,
              message: `should provide parameters with static keys`,
            });
            return;
          }
          if (nodeMap[p.key.name] === undefined) {
            context.report({
              node: p,
              message: `useless parameter`,
            });
            return;
          }
          visit[p.key.name] = true;
        }
        const missingParameters = Object.keys(nodeMap).filter(
          (key) => !visit[key]
        );
        if (missingParameters.length) {
          context.report({
            node: node.arguments[1],
            message: `missing parameters: '${missingParameters.join(',')}'`,
          });
          return;
        }

        if (Object.values(nodeMap).some((type) => type === 8)) {
          // tag
          const richNameRegexp = new RegExp(richNamePattern);
          if (!richNameRegexp.test(getFunctionName(node))) {
            context.report({
              node: node,
              message: `should use rich function '${richNamePattern}'`,
            });
            return;
          }
        }
      },
    };
  },
};
