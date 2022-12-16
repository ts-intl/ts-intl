const { isStaticLiteral, isTargetCallExpression } = require('./utils/is');
const { getStaticLiteralValue } = require('./utils/get');
const { LocaleMessages } = require('./utils/messages');

module.exports = {
  name: 'no-missing-keys',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow localization missing keys',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          fallbackNamespace: {
            type: 'string',
          },
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
          fallbackNamespace,
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

        switch (code) {
          case 0:
            return;
          case 1:
            context.report({
              node,
              message: 'no namespace provided',
              fix(fixer) {
                const prependNs = (ns) => [ns, key].join(namespaceDivider);
                const existNs = Object.keys(localeMessages.dict).find(
                  (ns) =>
                    localeMessages.hasPath(
                      prependNs(ns),
                      namespaceDivider,
                      keyDivider
                    ).code === 0
                );
                return fixer.replaceText(
                  node.arguments[0],
                  `\`${prependNs(existNs || fallbackNamespace, key)}\``
                );
              },
            });
            break;
          case 2:
            context.report({
              node,
              message: `no namespace '${msg}' found`,
            });
            break;
          case 3:
            context.report({
              node,
              message: `no path '${msg}' found`,
            });
            break;
          case 4:
            context.report({
              node,
              message: 'endpoint is not string',
            });
            break;
        }
      },
    };
  },
};
