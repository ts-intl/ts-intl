import { Node } from '../node';
import { createRule, getSchema } from '../utils/eslint';
import { getFunctionName, getStaticLiteralValue } from '../utils/get';
import { isTargetCallExpression } from '../utils/is';

export const noRawText = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'detect potential natural language which need to be translated',
      category: 'Recommended',
      recommended: true,
    },
    ...getSchema([
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
        new RegExp(body, flags).test(filename)
      )
    ) {
      return {};
    }

    const scopeManager = new ScopeManager(ignoreNodes);

    const check = (node: Node) => {
      const isRawText =
        checkAncestor(node) &&
        checkScope() &&
        checkIsPotentialAssignment(node) &&
        checkText(node);
      return isRawText;
    };

    const checkAncestor = (node: Node) => {
      if (!node.parent) return;
      if (
        [
          'ImportDeclaration',
          'ExportAllDeclaration',
          'ExportNamedDeclaration',
        ].includes(node.parent.type)
      )
        return;
      if (node.parent.type === 'TSLiteralType') return;
      return true;
    };

    const checkScope = () => {
      if (scopeManager.isInIgnoreNodes) return;
      if (scopeManager.isInTargetCall) return;
      return true;
    };

    const checkText = (node: Node) => {
      let text = getStaticLiteralValue(node);
      if (typeof text !== 'string') return false;
      text = text.trim();
      const { matchedPattern, ignoreTexts = [] } = context.options[0];
      if (!new RegExp(matchedPattern).test(text)) return false;
      if (
        ignoreTexts.some(({ body, flags }: { body: string; flags: string }) =>
          new RegExp(body, flags).test(text)
        )
      )
        return false;
      return true;
    };

    const checkIsPotentialAssignment = (node: Node) => {
      if (!node.parent) return;
      if (node.parent.type === 'Property' && node === node.parent.value)
        return true;
      if (
        node.parent.type === 'VariableDeclarator' &&
        node === node.parent.init
      )
        return true;
      if (
        node.parent.type === 'ArrayExpression' &&
        node.parent.elements.includes(node as typeof node.parent.elements[0])
      )
        return true;
      if (node.type === 'JSXText') return true;
      if (node.parent.type === 'JSXAttribute' && node === node.parent.value)
        return true;
      if (
        node.parent.type === 'ConditionalExpression' &&
        node !== node.parent.test
      )
        return true;
      if (
        node.parent.type === 'AssignmentPattern' &&
        node === node.parent.right
      )
        return true;
      if (
        node.parent.type === 'CallExpression' &&
        node.parent.arguments.includes(node as typeof node.parent.arguments[0])
      )
        return true;
    };

    const execute = (node: Node) => {
      if (!check(node) || !node.loc) return;
      context.report({
        loc: node.loc,
        message: `should translate '${getStaticLiteralValue(node)
          .trim()
          .slice(0, 20)}'`,
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
            (node.key as any).name
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

class ScopeManager {
  _targetCallStack = [false];
  _ignoreStack = [false];
  ignoreConfig: Record<string, RegExp[]>;

  constructor(
    ignoreNodes: {
      type: string;
      body: string;
      flags: string;
    }[]
  ) {
    this.ignoreConfig = ignoreNodes.reduce((all, { type, body, flags }) => {
      const regexp = new RegExp(body, flags);
      type.split(',').forEach((t) => {
        all[t] ? all[t].push(regexp) : (all[t] = [regexp]);
      });
      return all;
    }, {} as Record<string, RegExp[]>);
  }

  get isInIgnoreNodes() {
    return this._ignoreStack[this._ignoreStack.length - 1];
  }

  pushIgnoreStack(type: string, text: string) {
    this._ignoreStack.push(
      this._ignoreStack[this._ignoreStack.length - 1] ||
        (this.ignoreConfig[type] || []).some((regexp) => regexp.test(text))
    );
  }
  forcePushIgnoreStack(ignore: boolean) {
    this._ignoreStack.push(ignore);
  }
  popIgnoreStack() {
    this._ignoreStack.pop();
  }

  enterCall(isTargetCall: boolean) {
    this._targetCallStack.push(
      this._targetCallStack[this._targetCallStack.length - 1] || isTargetCall
    );
  }
  exitCall() {
    this._targetCallStack.pop();
  }

  get isInTargetCall() {
    return this._targetCallStack[this._targetCallStack.length - 1];
  }
}
