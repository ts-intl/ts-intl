import { Rule } from 'eslint';

import { Node } from '../node';
import { getFunctionName, getNodeName } from './get';

export const isStaticLiteral = (node: Node) => {
  return Boolean(
    node &&
      (node.type === 'Literal' ||
        (node.type === 'TemplateLiteral' && node.expressions.length === 0))
  );
};

export const isTargetCallExpression = (
  context: Rule.RuleContext,
  node: Node
) => {
  if (node.type !== 'CallExpression') return false;

  const {
    funcNamePattern = '',
    hookNamePattern = '',
    richNamePattern = '',
  } = context.options[0] || {};

  if (!node.arguments || !node.arguments.length) return false;

  const funcNameRegexp = new RegExp(funcNamePattern);

  if (funcNameRegexp.test(getFunctionName(node))) {
    return true;
  }

  const hookNameRegexp = new RegExp(hookNamePattern);

  if (
    node.callee.type === 'CallExpression' &&
    hookNameRegexp.test(getFunctionName(node.callee as Node))
  )
    return true;

  const richNameRegexp = new RegExp(richNamePattern);

  if (
    node.callee.type === 'MemberExpression' &&
    richNameRegexp.test(getFunctionName(node))
  ) {
    if (funcNameRegexp.test(getNodeName(context, node.callee.object as Node)))
      return true;
    if (
      node.callee.object.type === 'CallExpression' &&
      hookNameRegexp.test(getFunctionName(node.callee.object as Node))
    )
      return true;
  }

  return false;
};
