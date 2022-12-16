const { join, parse } = require('path');
const { LocaleMessages } = require('./utils/messages');

const otherLocales = {};
const getLocale = (fullPath, locale, watchMode = !!process.env.VSCODE_PID) => {
  return (otherLocales[`${fullPath}-${locale}`] =
    otherLocales[`${fullPath}-${locale}`] ||
    new LocaleMessages(fullPath, locale, watchMode));
};

module.exports = {
  name: 'no-missing-keys-in-other-locales',
  meta: {
    type: 'layout',
    docs: {
      description: 'disallow missing keys in other locales',
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
          otherLocales: {
            type: 'array',
            items: { type: 'string' },
          },
          namespaceDivider: {
            type: 'string',
          },
          keyDivider: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    if (!context.parserServices.isJSON) return {};
    const filename = context.getFilename();
    const {
      fullPath,
      locale,
      otherLocales = [],
      namespaceDivider,
      keyDivider,
    } = context.options[0] || {};

    const isEntry = filename === join(fullPath, `${locale}.json`);
    const isNsFile = parse(filename).dir === join(fullPath, locale);
    if (!isEntry && !isNsFile) return {};

    const path = [];
    const ns = isNsFile ? parse(filename).name : undefined;
    ns && path.push(ns);

    const enter = (node, key) => {
      if (typeof key !== 'string') return;
      const missingLocals = [];
      path.push(key);
      const [namespace, ...keys] = path;
      const pathString = keys.length
        ? [namespace, keys.join(keyDivider)].join(namespaceDivider)
        : namespace;
      otherLocales.forEach((lng) => {
        const { code, msg } = getLocale(fullPath, lng).hasPath(
          pathString,
          namespaceDivider,
          keyDivider
        );
        if (code === 0 && msg) return;
        if (code === 4 && node.value.type === 'JSONObjectExpression') return;
        missingLocals.push([lng, code === 0 && !msg ? 'value' : 'key']);
      });
      if (missingLocals.length) {
        context.report({
          node: node.key,
          message: missingLocals
            .map(
              ([lng, target]) => `missing '${pathString}' ${target} in '${lng}'`
            )
            .join(', '),
        });
      }
    };

    const exit = (key) => {
      if (typeof key !== 'string') return;
      path.pop();
    };

    return {
      JSONProperty(node) {
        enter(
          node,
          node.key.type === 'JSONLiteral' ? `${node.key.value}` : node.key.name
        );
      },
      'JSONProperty:exit'(node) {
        exit(
          node.key.type === 'JSONLiteral' ? `${node.key.value}` : node.key.name
        );
      },
    };
  },
};
