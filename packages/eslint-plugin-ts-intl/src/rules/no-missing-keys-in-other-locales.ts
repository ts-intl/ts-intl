import { AST } from 'jsonc-eslint-parser';
import { join, parse } from 'path';
import {
  DictionaryController,
  DictionaryParseErrorType,
  getDictionaryControllerFs,
} from 'shared';

import { createRule, getSchema } from '../utils/eslint';

const otherLocalePromises: Record<string, Promise<DictionaryController>> = {};
const getLocale = (
  fullPath: string,
  locale: string,
  watchMode = process.env.VSCODE_PID !== undefined
) => {
  return (otherLocalePromises[`${fullPath}-${locale}`] =
    otherLocalePromises[`${fullPath}-${locale}`] ||
    getDictionaryControllerFs({
      fullPath,
      locale,
      watchMode,
    }));
};

export const noMissingKeysInOtherLocales = createRule({
  meta: {
    type: 'layout',
    docs: {
      description: 'disallow missing keys in other locales',
      category: 'Best Practices',
      recommended: false,
    },
    ...getSchema([
      'namespaceDivider',
      'keyDivider',
      'otherLocales',
      'fullPath',
      'locale',
    ]),
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

    const path: string[] = [];
    const ns = isNsFile ? parse(filename).name : undefined;
    ns && path.push(ns);

    const enter = (node: AST.JSONProperty) => {
      const key = getPropertyName(node);
      if (typeof key !== 'string') return;
      const missingLocals: [string, 'value' | 'key'][] = [];
      path.push(key);
      const [namespace, ...keys] = path;
      const pathString = keys.length
        ? [namespace, keys.join(keyDivider)].join(namespaceDivider)
        : namespace;
      otherLocales.forEach(async (locale: string) => {
        const controller = await getLocale(fullPath, locale);
        const { errorType, msg } = controller.hasPathToLeaf(
          pathString,
          namespaceDivider,
          keyDivider
        );
        if (errorType === undefined && msg) return;
        if (
          errorType === DictionaryParseErrorType.MissingValue &&
          node.value.type === 'JSONObjectExpression'
        )
          return;
        missingLocals.push([
          locale,
          errorType === undefined && !msg ? 'value' : 'key',
        ]);
      });
      if (!missingLocals.length) return;
      context.report({
        loc: node.key.loc,
        message: missingLocals
          .map(
            ([lng, target]) => `missing '${pathString}' ${target} in '${lng}'`
          )
          .join(', '),
      });
    };

    const exit = (node: AST.JSONProperty) => {
      if (typeof getPropertyName(node) !== 'string') return;
      path.pop();
    };

    return {
      JSONProperty(node: unknown) {
        enter(node as AST.JSONProperty);
      },
      'JSONProperty:exit'(node: unknown) {
        exit(node as AST.JSONProperty);
      },
    };
  },
});

const getPropertyName = (node: AST.JSONProperty) => {
  return node.key.type === 'JSONLiteral' ? `${node.key.value}` : node.key.name;
};
