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
    let raw = context.getSourceCode().getText(body, 1, 1);
    const range = body.range as [number, number];
    if (raw[0] === '(') {
      range[0] -= 1;
    } else {
      raw = raw.slice(1);
    }
    if (raw[raw.length - 1] === ')') {
      range[1] += 1;
    } else {
      raw = raw.slice(0, -1);
    }
    if (preFix) {
      const preLen = preFix.range[0] - range[0];
      const sufLen = range[1] - preFix.range[1];
      raw = raw.slice(0, preLen) + preFix.text + raw.slice(raw.length - sufLen);
    }
    return fixer.replaceTextRange(
      range,
      `{ const ${opts.tFunction} = ${opts.useTranslations}();\n return ${raw}; }`,
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
    return;
  return fixer.insertTextBefore(
    body.body[0],
    `const ${opts.tFunction} = ${opts.useTranslations}();\n`,
  );
};
