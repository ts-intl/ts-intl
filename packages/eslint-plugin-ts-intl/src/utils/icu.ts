import {
  MessageFormatElement,
  parse,
  TYPE,
} from '@formatjs/icu-messageformat-parser';

export const collectVariableNodes = (key: string) => {
  const root = parse(key);
  const nodeMap: Record<string, TYPE> = {};
  const dfs = (n: MessageFormatElement[] | MessageFormatElement = root) => {
    if (!n) return;
    if (n instanceof Array) {
      n.forEach(dfs);
      return;
    }
    if (n.type === TYPE.argument) {
      // normal parameter
      nodeMap[n.value] = n.type;
      return;
    }
    if (n.type === TYPE.tag) {
      // tag
      nodeMap[n.value] = n.type;
      dfs(n.children);
      return;
    }
    if (n.type === TYPE.select || n.type === TYPE.plural) {
      // select and plural
      nodeMap[n.value] = n.type;
      if (!n.options) return;
      Object.values(n.options).forEach((option) => dfs(option.value));
    }
  };
  dfs();
  return nodeMap;
};
