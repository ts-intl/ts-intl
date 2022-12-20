import {
  CallExpression,
  createSourceFile,
  forEachChild,
  Node,
  ScriptTarget,
  SyntaxKind,
} from 'typescript';

import { ExtractIntlKeysOpts } from '../types';
import { extractIntlKeyArg, isIntlCall } from './utils';

export const extractIntlKeysFromCode = (
  sourceText: string,
  opts: ExtractIntlKeysOpts
) => {
  const sourceFile = createSourceFile(
    'source.tsx',
    sourceText,
    ScriptTarget.Latest
  );

  const res = new Set<string>();

  const traverse = (node: Node) => {
    if (node.kind === SyntaxKind.CallExpression) {
      const key = extractIntlKeyArg(node as CallExpression, opts.argIdx);
      if (key && isIntlCall(node as CallExpression, opts)) {
        res.add(key.text);
      }
    }
    forEachChild(node, traverse);
  };

  traverse(sourceFile);

  return [...res];
};
