import { Rule } from 'eslint';

import { FunctionLike, Node } from '../../node';
import { getReactHookOrComponent } from '../../utils/get';
import { fixBlock } from './fixBlock';
import { fixImport } from './fixImport';
import { fixText } from './fixText';
import { isAutoFillOpts } from './types';

export const genFix = (
  node: Node,
  context: Rule.RuleContext,
): Rule.ReportDescriptor['fix'] => {
  const opts = context.options[0].autoFill;
  if (!isAutoFillOpts(opts)) return;
  const fix: Rule.ReportDescriptor['fix'] = (fixer: Rule.RuleFixer) => {
    let cur = node;
    let target: FunctionLike | undefined;
    while (cur) {
      target = getReactHookOrComponent(cur);
      if (target) break;
      cur = cur.parent;
    }
    if (!target) return [];

    const props = { fixer, node, opts, context };
    const fixedImport = fixImport(props);
    const fixedText = fixText(props);
    const fixedBlock = fixBlock({
      ...props,
      preFix: fixedText,
    });
    const fixes: Rule.Fix[] = [];
    if (fixedBlock) {
      if (!fixedText) fixes.push(fixedBlock);
      else if (fixedBlock.range[1] < fixedText.range[0]) {
        fixes.push(fixedBlock);
        fixes.push(fixedText);
      } else {
        // overlap
        fixes.push(fixedBlock);
      }
    } else if (fixedText) {
      fixes.push(fixedText);
    }
    if (fixedImport) fixes.push(fixedImport);
    return fixes;
  };
  return fix;
};
