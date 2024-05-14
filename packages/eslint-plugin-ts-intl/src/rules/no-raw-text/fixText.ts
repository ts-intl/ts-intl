import { DictionaryController, Project } from '@ts-intl/shared';
import { Rule } from 'eslint';

import { Node, Text } from '../../node';
import { checkIsPotentialAssignment } from './genCheck';
import { AutoFillOpts, FixGetter } from './types';

export const fixText: FixGetter = ({ fixer, opts, node }) => {
  if (!isText(node)) return;
  const { value, genT } = getGenT(node) ?? {};
  if (!value || !genT) return;
  const { key } = getPathByValue(value, opts);
  return addT(fixer, node, genT(key));
};

const getGenT = (node: Text) => {
  let value = '';
  const params: string[] = [];
  if (node.type === 'TemplateLiteral') {
    for (const e of node.expressions) {
      if (e.type !== 'Identifier') return;
      params.push(e.name);
    }
    for (let i = 0; i < node.quasis.length; i += 1) {
      const q = node.quasis[i];
      value += q.value.cooked || q.value.raw;
      if (i < params.length) value += '{' + params[i] + '}';
    }
  } else {
    value = node.value as string;
  }
  value = value.trim();
  if (!value) return;
  return {
    value,
    genT: (key: string) =>
      params.length ? `t('${key}', {${params.join(', ')}})` : `t('${key}')`,
  };
};

const getPathByValue = (value: string, opts: AutoFillOpts) => {
  const project = Project.getSingleton(opts.rootDir);
  const controller = DictionaryController.getControllerSingletonFs({
    localePath: project.projectConfig.path.dictionary,
    locale: project.projectConfig.locale.basic,
    watchMode: process.env.VSCODE_PID !== undefined,
  });
  const { nsDivider, keyDivider } = project.projectConfig.syntax;
  const key = value.replace(
    new RegExp(`[${nsDivider}${keyDivider}]`, 'g'),
    ' ',
  );
  const existed: string[] = [];
  controller.traverse(
    (path, originValue) => {
      if (path.split(keyDivider).pop() === key && value === originValue)
        existed.push(path);
    },
    nsDivider,
    keyDivider,
  );
  if (existed.length)
    return {
      key: existed[0],
      isExisted: true,
    };
  const nsd = controller.dictionary[opts.fallbackNamespace];
  let nextKey = key;
  let index = 0;
  while (typeof nsd === 'object' && nsd[nextKey]) {
    index += 1;
    nextKey = `${key}_${index}`;
  }
  return {
    key: [opts.fallbackNamespace, nextKey].join(nsDivider),
    isExisted: false,
  };
};

const addT = (
  fixer: Rule.RuleFixer,
  node: Node,
  tStr: string,
): Rule.Fix | undefined => {
  if (node.parent.type === 'Property' && node === node.parent.value) {
    const range = node.parent.range as [number, number];
    let left: string | undefined;
    if (node.parent.key.type === 'Literal') {
      left = `${node.parent.key.raw}`;
    } else if (node.parent.key.type === 'Identifier') {
      left = `${node.parent.key.name}`;
    }
    if (!left) return;
    if (left && node.parent.computed) {
      left = `[${left}]`;
    }
    return fixer.replaceTextRange(range, `${left}: ${tStr}`);
  }
  if (node.parent.type === 'JSXAttribute' && node === node.parent.value) {
    const range = node.parent.range as [number, number];
    return fixer.replaceTextRange(range, `${node.parent.name.name}={${tStr}}`);
  }
  if (node.type === 'JSXText') {
    const range = node.range as [number, number];
    return fixer.replaceTextRange(range, `{${tStr}}`);
  }
  if (!checkIsPotentialAssignment(node)) return;
  const range = node.range as [number, number];
  return fixer.replaceTextRange(range, tStr);
};

const isText = (node: Node): node is Text =>
  node.type === 'Literal' ||
  node.type === 'TemplateLiteral' ||
  node.type === 'JSXText';

/**
 * @deprecated should not have side effect
 * @param key
 * @param value
 * @param opts
 * @returns
 */
// const writeDictionary = (key: string, value: string, opts: AutoFillOpts) => {
//   const project = Project.getSingleton(opts.rootDir);
//   const resolved = dictionaryResolverFs(
//     project.projectConfig.path.dictionary,
//     project.projectConfig.locale.basic,
//     readJsonFile,
//   );
//   if (!resolved.localePath)
//     resolved.localePath = resolve(
//       project.projectConfig.path.dictionary,
//       `${project.projectConfig.locale.basic}.json`,
//     );
//   const dictionary: Dictionary = JSON.parse(
//     JSON.stringify(resolved.dictionary ?? {}),
//   );
//   const { nsDivider, keyDivider } = project.projectConfig.syntax;
//   const [ns, ..._path] = key.split(nsDivider);
//   const jsonPath = resolved.multiSources
//     ? resolve(resolved.localePath, `${ns}.json`)
//     : resolved.localePath;
//   const path = (resolved.multiSources ? _path.join(nsDivider) : key).split(
//     keyDivider,
//   );
//   const target = (resolved.multiSources ? dictionary[ns] : dictionary) ?? {};
//   if (typeof target === 'string') throw new Error(`Conflict: ${key}`);
//   let cur = target;
//   for (let i = 0; i < path.length; i += 1) {
//     const pathKey = path[i];
//     if (typeof cur === 'string') throw new Error(`Conflict: ${key}`);
//     if (i === path.length - 1) {
//       if (cur[pathKey] === value) return;
//       if (cur[pathKey] && typeof cur[pathKey] === 'object')
//         throw new Error(`Conflict: ${key}`);
//       cur[pathKey] = value;
//       break;
//     }
//     if (!cur[pathKey]) cur[pathKey] = {};
//     const child = cur[pathKey];
//     if (typeof child === 'string') throw new Error(`Conflict: ${key}`);
//     cur = child;
//   }
//   writeJsonFileSync(jsonPath, target, true);
// };
