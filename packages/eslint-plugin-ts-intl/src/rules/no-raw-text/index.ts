import { Node } from '../../node';
import { createRule, getSchema } from '../../utils/eslint';
import { getFunctionName, getStaticLiteralValue } from '../../utils/get';
import { isTargetCallExpression } from '../../utils/is';
import { genCheck } from './genCheck';
import { genFix } from './genFix';
import { ScopeManager } from './ScopeManager';

export const noRawText = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'detect potential natural language which need to be translated',
      category: 'Recommended',
      recommended: true,
    },
    fixable: 'code',
    ...getSchema([
      'autoFill',
      'funcNamePattern',
      'hookNamePattern',
      'richNamePattern',
      'include',
      'exclude',
      'matchedPattern',
      'ignoreNodes',
      'ignoreTexts',
    ]),
  },
  create(context) {
    const filename = context.getFilename();
    const { exclude = [], include, ignoreNodes = [] } = context.options[0];
    if (include && !new RegExp(include.body, include.flags).test(filename)) {
      return {};
    }
    if (
      exclude.some(({ body, flags }: { body: string; flags: string }) =>
        new RegExp(body, flags).test(filename),
      )
    ) {
      return {};
    }

    const scopeManager = new ScopeManager(ignoreNodes);

    const check = genCheck(context, scopeManager);

    const execute = (node: Node) => {
      if (!check(node) || !node.loc) return;
      context.report({
        loc: node.loc,
        message: `should translate '${getStaticLiteralValue(node)
          .trim()
          .slice(0, 20)}'`,
        fix: genFix(node, context),
      });
    };

    return {
      Literal(node) {
        execute(node);
      },
      TaggedTemplateExpression(node) {
        execute(node);
      },
      TemplateLiteral(node) {
        execute(node);
      },
      JSXText(node: any) {
        execute(node);
      },
      // BinaryExpression(node) {},
      CallExpression(node) {
        scopeManager.enterCall(isTargetCallExpression(context, node));
        scopeManager.pushIgnoreStack(node.type, getFunctionName(node));
      },
      ['CallExpression:exit']() {
        scopeManager.exitCall();
        scopeManager.popIgnoreStack();
      },
      JSXAttribute(node: any) {
        scopeManager.pushIgnoreStack(node.type, node.name.name);
      },
      ['JSXAttribute:exit']() {
        scopeManager.popIgnoreStack();
      },
      JSXElement() {
        // force reset ancestor JSXAttr flags
        scopeManager.forcePushIgnoreStack(false);
      },
      ['JSXElement:exit']() {
        scopeManager.popIgnoreStack();
      },
      Property(node) {
        scopeManager.pushIgnoreStack(
          node.type,
          getStaticLiteralValue(node.key as Node) ||
            (node.key as any).raw ||
            (node.key as any).name,
        );
      },
      ['Property:exit']() {
        scopeManager.popIgnoreStack();
      },
      VariableDeclarator(node) {
        if (node.id.type === 'Identifier') {
          scopeManager.pushIgnoreStack(node.type, node.id.name);
        }
      },
      ['VariableDeclarator:exit'](node: Node) {
        if (
          node.type === 'VariableDeclarator' &&
          node.id.type === 'Identifier'
        ) {
          scopeManager.popIgnoreStack();
        }
      },
      AssignmentPattern(node) {
        if (node.left.type === 'Identifier') {
          scopeManager.pushIgnoreStack(node.type, node.left.name);
        }
      },
      ['AssignmentPattern:exit'](node: Node) {
        if (
          node.type === 'AssignmentPattern' &&
          node.left.type === 'Identifier'
        ) {
          scopeManager.popIgnoreStack();
        }
      },
    };
  },
});
