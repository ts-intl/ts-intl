import { TYPE } from '@formatjs/icu-messageformat-parser';
import { getDictionaryControllerFsSingleton } from '@ts-intl/shared';

import { Node } from '../node';
import { createRule, getSchema } from '../utils/eslint';
import { getFunctionName, getStaticLiteralValue } from '../utils/get';
import { collectVariableNodes } from '../utils/icu';
import { isStaticLiteral, isTargetCallExpression } from '../utils/is';

export const syntaxIcuTs = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow not icu style keys',
      category: 'Best Practices',
      recommended: false,
    },
    ...getSchema([
      'funcNamePattern',
      'hookNamePattern',
      'richNamePattern',
      'namespaceDivider',
      'keyDivider',
      'fullPath',
      'locale',
    ]),
  },
  create(context) {
    const { fullPath, locale, keyDivider, namespaceDivider, richNamePattern } =
      context.options[0] || {};
    const baseControllerPromise = getDictionaryControllerFsSingleton({
      fullPath,
      locale,
      watchMode: process.env.VSCODE_PID !== undefined,
    });

    return {
      CallExpression: async (node) => {
        if (!isTargetCallExpression(context, node)) return;
        if (!isStaticLiteral(node.arguments[0] as Node)) return;
        const baseController = await baseControllerPromise;
        const key = getStaticLiteralValue(node.arguments[0] as Node);
        const { errorType, msg = '' } = baseController.hasPathToLeaf(
          key,
          namespaceDivider,
          keyDivider
        );
        // no-invalid-keys would handle invalid key
        if (errorType !== undefined) return;

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

        const visit: Record<string, boolean> = {};
        for (const p of node.arguments[1].properties) {
          // TODO: handle SpreadElement
          if (p.type !== 'Property') continue;
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

        if (Object.values(nodeMap).some((type) => type === TYPE.tag)) {
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
});
