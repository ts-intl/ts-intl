import { Rule } from 'eslint';

import { Node } from '../../node';
import { getStaticLiteralValue } from '../../utils/get';
import { ScopeManager } from './ScopeManager';

export const genCheck =
  (context: Rule.RuleContext, scopeManager: ScopeManager) => (node: Node) =>
    checkAncestor(node) &&
    checkScope(scopeManager) &&
    checkIsPotentialAssignment(node) &&
    checkText(node, context);

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

const checkScope = (scopeManager: ScopeManager) => {
  if (scopeManager.isInIgnoreNodes) return;
  if (scopeManager.isInTargetCall) return;
  return true;
};

const checkText = (node: Node, context: Rule.RuleContext) => {
  let text = getStaticLiteralValue(node);
  if (typeof text !== 'string') return false;
  text = text.trim();
  if (!text) return false;
  const { matchedPattern, ignoreTexts = [] } = context.options[0];
  if (!new RegExp(matchedPattern).test(text)) return false;
  if (
    ignoreTexts.some(({ body, flags }: { body: string; flags: string }) =>
      new RegExp(body, flags).test(text),
    )
  )
    return false;
  return true;
};

export const checkIsPotentialAssignment = (node: Node) => {
  if (!node.parent) return;
  if (node.parent.type === 'Property' && node === node.parent.value)
    return true;
  if (node.parent.type === 'VariableDeclarator' && node === node.parent.init)
    return true;
  if (
    node.parent.type === 'ArrayExpression' &&
    node.parent.elements.includes(node as (typeof node.parent.elements)[0])
  )
    return true;
  if (node.type === 'JSXText') return true;
  if (node.parent.type === 'JSXAttribute' && node === node.parent.value)
    return true;
  if (node.parent.type === 'ConditionalExpression' && node !== node.parent.test)
    return true;
  if (node.parent.type === 'AssignmentPattern' && node === node.parent.right)
    return true;
  if (node.parent.type === 'AssignmentExpression' && node === node.parent.right)
    return true;
  if (
    node.parent.type === 'CallExpression' &&
    node.parent.arguments.includes(node as (typeof node.parent.arguments)[0])
  )
    return true;
  if (
    node.parent.type === 'ArrowFunctionExpression' &&
    node.parent.body === node
  )
    return true;
};
