import { Rule } from 'eslint';

// https://github.com/intlify/eslint-plugin-vue-i18n/blob/fc089e937bde9658eff7a7ad438b79d9d382909f/lib/types/nodes.ts

export interface Position {
  /** >= 1 */
  line: number;
  /** >= 0 */
  column: number;
}
export type Range = [number, number];
export interface SourceLocation {
  start: Position;
  end: Position;
}

export type Node =
  | Rule.Node
  | (JSXText & { parent: Node })
  | (TSLiteralType & { parent: Node })
  | (JSXAttribute & { parent: Node; name: { name: string } })
  | (JsxExpression & { parent: Node });

export type Program = Node & {
  type: 'Program';
};

export type FunctionLike = Node & {
  type:
    | 'FunctionDeclaration'
    | 'FunctionExpression'
    | 'ArrowFunctionExpression';
};

export type Text = Node & {
  type: 'Literal' | 'TemplateLiteral' | 'JSXText';
};

interface MaybeNode {
  type: string;
  range: Range;
  loc: SourceLocation;
}

interface JSXText extends MaybeNode {
  type: 'JSXText';
  value: string;
  raw: string;
}

interface TSLiteralType extends MaybeNode {
  type: 'TSLiteralType';
}

interface JSXAttribute extends MaybeNode {
  type: 'JSXAttribute';
  value: any;
  raw: string;
}

interface JsxExpression extends MaybeNode {
  type: 'JSXExpressionContainer';
  expression: any;
}
