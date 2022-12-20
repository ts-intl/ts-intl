import {
  CallExpression,
  NoSubstitutionTemplateLiteral,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

export const extractIntlKeyArg = (
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
