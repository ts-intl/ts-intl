import {
  DictionaryController,
  DictionaryParseErrorType,
} from '@ts-intl/shared';

import { Node } from '../node';
import { createRule, getSchema } from '../utils/eslint';
import { getStaticLiteralValue } from '../utils/get';
import { isStaticLiteral, isTargetCallExpression } from '../utils/is';

export const noInvalidKeys = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow localization missing keys',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    ...getSchema([
      'funcNamePattern',
      'hookNamePattern',
      'richNamePattern',
      'namespaceDivider',
      'keyDivider',
      'fallbackNamespace',
      'localePath',
      'locale',
    ]),
  },
  create(context) {
    const {
      localePath,
      locale,
      keyDivider,
      namespaceDivider,
      fallbackNamespace,
    } = context.options[0] || {};
    const controller = DictionaryController.getControllerSingletonFs({
      localePath,
      locale,
      watchMode: process.env.VSCODE_PID !== undefined,
    });

    return {
      CallExpression: (node) => {
        if (!isTargetCallExpression(context, node)) return;
        if (!isStaticLiteral(node.arguments[0] as Node)) return;
        const key = getStaticLiteralValue(node.arguments[0] as Node);
        const { errorType, msg = '' } = controller.hasPathToLeaf(
          key,
          namespaceDivider,
          keyDivider
        );
        if (!errorType) return;
        switch (errorType) {
          case DictionaryParseErrorType.MissingNamespace:
            context.report({
              node,
              message: 'no namespace provided',
              fix(fixer) {
                const prependNs = (ns: string) =>
                  [ns, key].join(namespaceDivider);
                const existNs = Object.keys(controller.dictionary).find(
                  (ns) =>
                    !controller.hasPathToLeaf(
                      prependNs(ns),
                      namespaceDivider,
                      keyDivider
                    ).errorType
                );
                return fixer.replaceText(
                  node.arguments[0],
                  `\`${prependNs(existNs || fallbackNamespace)}\``
                );
              },
            });
            break;
          case DictionaryParseErrorType.MissingKey:
            context.report({
              node,
              message: `no namespace '${msg}' found`,
            });
            break;
          case DictionaryParseErrorType.MissingChild:
            context.report({
              node,
              message: `no path '${msg}' found`,
            });
            break;
          case DictionaryParseErrorType.MissingValue:
            context.report({
              node,
              message: 'endpoint is not string',
            });
            break;
        }
      },
    };
  },
});
