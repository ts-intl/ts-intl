import {
  CallExpression,
  createSourceFile,
  forEachChild,
  Identifier,
  Node,
  NoSubstitutionTemplateLiteral,
  PropertyAccessExpression,
  ScriptTarget,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

export type CollectKeysOpts = {
  funcNamePattern: string;
  hookNamePattern?: string;
  richNamePattern?: string;
  argIdx?: number;
};

export const collectKeys = (sourceText: string, opts: CollectKeysOpts) => {
  const sourceFile = createSourceFile(
    'source.tsx',
    sourceText,
    ScriptTarget.Latest
  );

  const res = new Set<string>();

  const traverse = (node: Node) => {
    if (node.kind === SyntaxKind.CallExpression) {
      const key = extractKeyArg(node as CallExpression, opts.argIdx);
      if (key && isTargetCall(node as CallExpression, opts)) {
        res.add(key.text);
      }
    }
    forEachChild(node, traverse);
  };

  traverse(sourceFile);

  return [...res];
};

const isTargetCall = (node: CallExpression, opts: CollectKeysOpts) => {
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
  return undefined;
};

const testName = (node: Node, regexp: RegExp) => {
  return (
    node.kind === SyntaxKind.Identifier &&
    regexp.test((node as Identifier).text)
  );
};

const extractKeyArg = (
  node: CallExpression,
  argIdx = 0
): StringLiteral | NoSubstitutionTemplateLiteral | undefined => {
  const keyArg = node.arguments[argIdx];
  if (
    [
      SyntaxKind.StringLiteral,
      SyntaxKind.NoSubstitutionTemplateLiteral,
    ].includes(keyArg?.kind)
  )
    return keyArg as StringLiteral | NoSubstitutionTemplateLiteral;
  return;
};
