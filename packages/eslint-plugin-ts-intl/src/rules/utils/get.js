const getNodeName = (context, node) => {
  if (node.type === 'Identifier') {
    return node.name;
  }
  const sourceCode = context.getSourceCode();
  if (
    sourceCode.ast.range[0] <= node.range[0] &&
    node.range[1] <= sourceCode.ast.range[1]
  ) {
    return sourceCode
      .getTokens(node)
      .map((t) => t.value)
      .join('');
  }
  const tokenStore = context.parserServices.getTemplateBodyTokenStore();
  return tokenStore
    .getTokens(node)
    .map((t) => t.value)
    .join('');
};

const getFunctionName = (node) =>
  (node.callee.type === 'MemberExpression' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name) ||
  (node.callee.type === 'Identifier' && node.callee.name) ||
  '';

const getStaticLiteralValue = (node) => {
  if (node.type === 'Literal') return node.value;
  if (node.type === 'TaggedTemplateExpression') return node.tag.value;
  if (node.type === 'TemplateLiteral') {
    return node.quasis
      .map(({ value }) => value.cooked || value.raw)
      .join('${}');
  }
  if (node.type === 'JSXText') return node.value || node.raw;
  return '';
};

module.exports = {
  getFunctionName,
  getNodeName,
  getStaticLiteralValue,
};
