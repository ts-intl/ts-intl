import { Rule } from 'eslint';

import { FunctionLike } from '../../node';
import { getReactHookOrComponent } from '../../utils/get';
import { FixGetter } from './types';

export const fixBlock: FixGetter = ({ fixer, node, opts, context, preFix }) => {
  let cur = node;
  while (cur) {
    const target = getReactHookOrComponent(cur);
    if (target)
      return _fixBlock({ fixer, node: target, opts, context, preFix });
    cur = cur.parent;
  }
};

const _fixBlock: FixGetter<FunctionLike> = ({
  fixer,
  context,
  node,
  opts,
  preFix,
}) => {
  const body = node.body;
  if (body.type !== 'BlockStatement') {
    const funcRange = node.range as [number, number];
    const funcHead = extractFuncHead(context, node);
    const bodyRaw = extractFuncBodyRaw(context, body, preFix);
    return fixer.replaceTextRange(
      funcRange,
      `${funcHead} { const ${opts.tFunction} = ${opts.useTranslations}();\n return ${bodyRaw}; }`,
    );
  }
  if (
    body.body.some((node) => {
      if (node.type !== 'VariableDeclaration') return;
      const d0 = node.declarations[0];
      if (d0.type !== 'VariableDeclarator') return;
      if (d0.id.type !== 'Identifier') return;
      if (d0.init?.type !== 'CallExpression') return;
      const callee = d0.init.callee;
      if (callee.type !== 'Identifier') return;
      return (
        d0.id.name === opts.tFunction && callee.name === opts.useTranslations
      );
    })
  )
    return; // tFunction existed
  return fixer.insertTextBefore(
    body.body[0],
    `const ${opts.tFunction} = ${opts.useTranslations}();\n`,
  );
};

const extractFuncHead = (context: Rule.RuleContext, node: FunctionLike) => {
  const funcRaw = context.getSourceCode().getText(node);
  let funcHead = '';
  if (node.type === 'ArrowFunctionExpression') {
    for (let i = 0; i < funcRaw.length; i += 1) {
      if (funcRaw[i] === '=' && funcRaw[i + 1] === '>') {
        funcHead = funcRaw.slice(0, i + 2);
        break;
      }
    }
  } else {
    let c = 0;
    for (let i = 0; i < funcRaw.length; i += 1) {
      if (funcRaw[i] === '(') {
        c += 1;
      } else if (funcRaw[i] === ')') {
        c -= 1;
        if (c === 0) {
          funcHead = funcRaw.slice(0, i + 1);
          break;
        }
      }
    }
  }
  return funcHead;
};

const extractFuncBodyRaw = (
  context: Rule.RuleContext,
  body: FunctionLike['body'],
  preFix: Rule.Fix | undefined,
) => {
  let bodyRaw = context.getSourceCode().getText(body);
  const bodyRange = body.range as [number, number];
  if (
    preFix &&
    preFix.range[0] >= bodyRange[0] &&
    preFix.range[1] <= bodyRange[1]
  ) {
    // pre fix is in body, so should apply text replacement
    const preLen = preFix.range[0] - bodyRange[0];
    const sufLen = bodyRange[1] - preFix.range[1];
    bodyRaw =
      bodyRaw.slice(0, preLen) +
      preFix.text +
      bodyRaw.slice(bodyRaw.length - sufLen);
  }
  return bodyRaw;
};
