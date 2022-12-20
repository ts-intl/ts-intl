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
export interface MaybeNode {
  type: string;
  range: Range;
  loc: SourceLocation;
}
export interface MaybeToken extends MaybeNode {
  value: string;
}

export interface JSXText extends MaybeNode {
  type: 'JSXText';
  value: string;
  raw: string;
  parent: MaybeNode;
}

export type Node = JSXText | Rule.Node;
