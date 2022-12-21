import {
  Location,
  parse as parseIcu,
} from '@formatjs/icu-messageformat-parser';
import { Rule } from 'eslint';
import { AST } from 'jsonc-eslint-parser';
import { join, parse } from 'path';

import { createRule } from './utils/eslint';

const keyMaxLength = 130;

export const icuJsonStyle = createRule({
  meta: {
    type: 'layout',
    docs: {
      description: 'disallow not icu style key-value in json',
      category: 'Best Practices',
      recommended: false,
    },
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
    if (!context.parserServices.isJSON) {
      return {};
    }
    const filename = context.getFilename();
    const { fullPath, locale, forbiddenPattern } = context.options[0] || {};
    if (
      filename !== join(fullPath, `${locale}.json`) &&
      parse(filename).dir !== join(fullPath, locale)
    ) {
      return {};
    }

    const forbiddenRegexp = new RegExp(forbiddenPattern);

    return {
      JSONProperty(node: unknown) {
        check(context, node as AST.JSONProperty, {
          forbiddenRegexp,
          forbiddenPattern,
        });
      },
    };
  },
});

const check = (
  context: Rule.RuleContext,
  node: AST.JSONProperty,
  {
    forbiddenRegexp,
    forbiddenPattern,
  }: {
    forbiddenRegexp: RegExp;
    forbiddenPattern: string;
  }
) => {
  const key =
    node.key.type === 'JSONLiteral' ? `${node.key.value}` : node.key.name;
  if (typeof key !== 'string') return;
  if (forbiddenRegexp.test(key)) {
    return context.report({
      loc: node.key.loc,
      message: `forbidden char in key '${forbiddenPattern}'`,
    });
  }
  if (key.length > keyMaxLength) {
    return context.report({
      loc: node.key.loc,
      message: `length of key is gt than ${keyMaxLength}`,
    });
  }
  if (
    !node.value ||
    !['JSONLiteral', 'JSONObjectExpression'].includes(node.value.type)
  ) {
    return context.report({
      loc: node.value.loc,
      message: `type of value must be literal or object, given '${node.value.type}'`,
    });
  }
  if (node.value && node.value.type === 'JSONLiteral') {
    const value = node.value.value;
    try {
      parseIcu(value as string);
    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        const { start } = node.value.loc;
        const { location, message } = err as SyntaxError & {
          location: Location;
        };
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
          message: `icu parser error: ${message}`,
        });
      }
    }
  }
};
