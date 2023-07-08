import {
  DictionaryController,
  DictionaryParseErrorType,
} from '@ts-intl/shared';
import { AST } from 'jsonc-eslint-parser';
import { join, parse } from 'path';

import { createRule, getSchema } from '../utils/eslint';

const otherLocaleController: Record<string, DictionaryController> = {};
const getLocale = (
  localePath: string,
  locale: string,
  watchMode = process.env.VSCODE_PID !== undefined
) => {
  return (otherLocaleController[`${localePath}-${locale}`] =
    otherLocaleController[`${localePath}-${locale}`] ||
    DictionaryController.getControllerFs({
      localePath,
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
    ...getSchema(['nsDivider', 'keyDivider', 'others', 'localePath', 'locale']),
  },
  create(context) {
    if (!context.parserServices.isJSON) return {};
    const filename = context.getFilename();
    const {
      localePath,
      locale,
      others = [],
      nsDivider,
      keyDivider,
    } = context.options[0] || {};

    const isEntry = filename === join(localePath, `${locale}.json`);
    const isNsFile = parse(filename).dir === join(localePath, locale);
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
        ? [namespace, keys.join(keyDivider)].join(nsDivider)
        : namespace;
      others.forEach((locale: string) => {
        const controller = getLocale(localePath, locale);
        const { errorType, msg } = controller.hasPathToLeaf(
          pathString,
          nsDivider,
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
            ([locale, target]) =>
              `missing '${pathString}' ${target} in '${locale}'`
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
