const { isTargetCallExpression } = require('./utils/is');
const { getStaticLiteralValue, getFunctionName } = require('./utils/get');

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'detect potential natural language which need to be translated',
      category: 'Recommended',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          matchedPattern: {
            type: 'string',
          },
          ignoreNodes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: 'string',
                body: 'string',
                flags: 'string',
                additionalProperties: false,
              },
            },
          },
          ignoreTexts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                body: 'string',
                flags: 'string',
                additionalProperties: false,
              },
            },
          },
          funcNamePattern: {
            type: 'string',
          },
          hookNamePattern: {
            type: 'string',
          },
          richNamePattern: {
            type: 'string',
          },
          exclude: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                body: 'string',
                flags: 'string',
                additionalProperties: false,
              },
            },
          },
          include: {
            type: 'object',
            properties: {
              body: 'string',
              flags: 'string',
              additionalProperties: false,
            },
          },
        },
      },
    ],
  },
  create(context) {
    const filename = context.getFilename();
    const { exclude = [], include } = context.options[0];
    if (include && !new RegExp(include.body, include.flags).test(filename)) {
      return {};
    }
    if (
      exclude.some(({ body, flags }) => new RegExp(body, flags).test(filename))
    ) {
      return {};
    }

    const scopeManager = new ScopeManager(context);

    const check = (node) => {
      const isRawText =
        checkAncestor(node) &&
        checkScope() &&
        checkIsPotentialAssignment(node) &&
        checkText(node);
      return isRawText;
    };

    const checkAncestor = (node) => {
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

    const checkText = (node) => {
      let text = getStaticLiteralValue(node);
      if (typeof text !== 'string') return;
      text = text.trim();
      const { matchedPattern, ignoreTexts = [] } = context.options[0];
      if (!new RegExp(matchedPattern).test(text)) return;
      if (
        ignoreTexts.some(({ body, flags }) =>
          new RegExp(body, flags).test(text)
        )
      )
        return;
      // console.log(text, node.parent.type);
      return true;
    };

    const checkIsPotentialAssignment = (node) => {
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
        node.parent.elements.includes(node)
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
        node.parent.arguments.includes(node)
      )
        return true;
    };

    const execute = (node) => {
      if (check(node)) {
        try {
          context.report({
            node,
            message: `should translate '${getStaticLiteralValue(node)
              .trim()
              .slice(0, 20)}'`,
          });
        } catch (err) {}
      }
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
      JSXText(node) {
        execute(node);
      },
      // BinaryExpression(node) {},
      CallExpression(node) {
        scopeManager.enterCall(node);
        scopeManager.pushIgnoreStack(node.type, getFunctionName(node));
      },
      ['CallExpression:exit']() {
        scopeManager.exitCall();
        scopeManager.popIgnoreStack();
      },
      JSXAttribute(node) {
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
          getStaticLiteralValue(node.key) || node.key.raw || node.key.name
        );
      },
      ['Property:exit']() {
        scopeManager.popIgnoreStack();
      },
      VariableDeclarator(node) {
        scopeManager.pushIgnoreStack(node.type, node.id.name);
      },
      ['VariableDeclarator:exit']() {
        scopeManager.popIgnoreStack();
      },
      AssignmentPattern(node) {
        scopeManager.pushIgnoreStack(node.type, node.left.name);
      },
      ['AssignmentPattern:exit']() {
        scopeManager.popIgnoreStack();
      },
    };
  },
};

class ScopeManager {
  _targetCallStack = [false];
  _ignoreStack = [false];

  constructor(context) {
    this.context = context;

    this.ignoreConfig = context.options[0].ignoreNodes.reduce(
      (all, { type, body, flags }) => {
        const regexp = new RegExp(body, flags);
        type.split(',').forEach((t) => {
          all[t] ? all[t].push(regexp) : (all[t] = [regexp]);
        });
        return all;
      },
      {}
    );
  }

  get isInIgnoreNodes() {
    return this._ignoreStack[this._ignoreStack.length - 1];
  }

  pushIgnoreStack(type, text) {
    this._ignoreStack.push(
      this._ignoreStack[this._ignoreStack.length - 1] ||
        (this.ignoreConfig[type] || []).some((regexp) => regexp.test(text))
    );
  }
  forcePushIgnoreStack(ignore) {
    this._ignoreStack.push(ignore);
  }
  popIgnoreStack() {
    this._ignoreStack.pop();
  }

  enterCall(node) {
    this._targetCallStack.push(
      this._targetCallStack[this._targetCallStack.length - 1] ||
        isTargetCallExpression(this.context, node)
    );
  }
  exitCall() {
    this._targetCallStack.pop();
  }

  get isInTargetCall() {
    return this._targetCallStack[this._targetCallStack.length - 1];
  }
}
