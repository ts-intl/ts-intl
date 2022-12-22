import {
  CallExpression,
  Identifier,
  Node,
  PropertyAccessExpression,
  SyntaxKind,
} from 'typescript';

import { ExtractIntlKeysOpts } from '../../types';

export const isIntlCall = (node: CallExpression, opts: ExtractIntlKeysOpts) => {
  const {
    funcNamePattern = '',
    hookNamePattern = '',
    richNamePattern = '',
  } = opts;

  // t()
  const funcNameRegexp = new RegExp(funcNamePattern);
  if (testName(node.expression, funcNameRegexp)) {
    return true;
  }

  const expression = node.expression;
  // useHook()()
  const hookNameRegexp = new RegExp(hookNamePattern);
  if (
    expression.kind === SyntaxKind.CallExpression &&
    testName((expression as CallExpression).expression, hookNameRegexp)
  ) {
    return true;
  }

  const richNameRegexp = new RegExp(richNamePattern);
  if (
    expression.kind === SyntaxKind.PropertyAccessExpression &&
    testName((expression as PropertyAccessExpression).name, richNameRegexp)
  ) {
    const pNode = (expression as PropertyAccessExpression).expression;
    // t.rich()
    if (testName(pNode, funcNameRegexp)) return true;
    // useHook().rich()
    const hNode = (pNode as CallExpression).expression;
    if (
      hNode.kind === SyntaxKind.CallExpression &&
      testName((hNode as CallExpression).expression, hookNameRegexp)
    ) {
      return true;
    }
    return true;
  }

  return false;
};

const testName = (node: Node, regexp: RegExp) => {
  return (
    node.kind === SyntaxKind.Identifier &&
    regexp.test((node as Identifier).text)
  );
};
