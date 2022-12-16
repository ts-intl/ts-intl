const { join, parse } = require('path');
const { parse: parseIcu } = require('@formatjs/icu-messageformat-parser');

const keyMaxLength = 130;

module.exports = {
  name: 'icu-message-format-json',
  meta: {
    type: 'layout',
    docs: {
      description: 'disallow not icu style key-value in json',
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
          forbiddenPattern: {
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
    const { fullPath, locale, forbiddenPattern } = context.options[0] || {};
    if (
      filename !== join(fullPath, `${locale}.json`) &&
      parse(filename).dir !== join(fullPath, locale)
    )
      return {};

    const forbiddenRegexp = new RegExp(forbiddenPattern);

    const check = (node, key) => {
      if (typeof key !== 'string') return;
      if (forbiddenRegexp.test(key)) {
        context.report({
          node: node.key,
          message: `forbidden char in key '${forbiddenPattern}'`,
        });
      }
      if (key.length > keyMaxLength) {
        context.report({
          node: node.key,
          message: `length of key is gt than ${keyMaxLength}`,
        });
      }
      if (
        !node.value ||
        !['JSONLiteral', 'JSONObjectExpression'].includes(node.value.type)
      ) {
        context.report({
          node: node.value,
          message: `type of value must be literal or object, given '${node.value.type}'`,
        });
      }
      if (node.value && node.value.type === 'JSONLiteral') {
        const value = node.value.value;
        try {
          parseIcu(value);
        } catch (err) {
          const { start } = context.getTokens(node.value)[0].loc;
          const { location } = err;
          context.report({
            loc: {
              start: {
                line: start.line + location.start.line - 1,
                column: start.column + location.start.column,
              },
              end: {
                line: start.line + location.end.line - 1,
                column: start.column + location.end.column,
              },
            },
            message: `icu parser error: ${err.message}`,
          });
        }
      }
    };

    return {
      JSONProperty(node) {
        check(
          node,
          node.key.type === 'JSONLiteral' ? `${node.key.value}` : node.key.name
        );
      },
    };
  },
};
