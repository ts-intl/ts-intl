import { Rule } from 'eslint';

import { FunctionLike, Node } from '../node';

export const getNodeName = (context: Rule.RuleContext, node: Node): string => {
  if (node.type === 'Identifier') {
    return node.name;
  }
  const sourceCode = context.getSourceCode();
  if (
    node.range &&
    sourceCode.ast.range[0] <= node.range[0] &&
    node.range[1] <= sourceCode.ast.range[1]
  ) {
    return sourceCode
      .getTokens(node as Rule.Node)
      .map((t) => t.value)
      .join('');
  }
  const tokenStore = context.parserServices.getTemplateBodyTokenStore();
  return tokenStore
    .getTokens(node)
    .map((t: { value: string }) => t.value)
    .join('');
};

export const getFunctionName = (node: Node) =>
  (node.type === 'CallExpression' &&
    node.callee &&
    ((node.callee.type === 'MemberExpression' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name) ||
      (node.callee.type === 'Identifier' && node.callee.name))) ||
  '';

export const getStaticLiteralValue = (node: Node) => {
  if (node.type === 'Literal')
    return typeof node.value === 'string' ? node.value : '';
  // if (node.type === 'TaggedTemplateExpression') {
  //   const { tag } = node;
  //   return tag.value;
  // }
  if (node.type === 'TemplateLiteral') {
    return node.quasis
      .map(({ value }) => value.cooked || value.raw)
      .join('${}');
  }
  if (node.type === 'JSXText') return node.value || node.raw;
  return '';
};

export const getReactHookOrComponent = (
  node: Node,
): FunctionLike | undefined => {
  let name: string | undefined;
  let target: FunctionLike | undefined;
  if (node.type === 'FunctionDeclaration') {
    name = node.id?.name;
    target = node;
  } else if (
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression'
  ) {
    const parent = node.parent;
    if (
      parent?.type === 'VariableDeclarator' &&
      parent.id.type === 'Identifier'
    ) {
      name = parent.id.name;
      target = node;
    }
  }
  if (!name?.match(/^(use|[A-Z])/)) return;
  return target;
};
