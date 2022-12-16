const { parse } = require('@formatjs/icu-messageformat-parser');

const collectVariableNodes = (key) => {
  const root = parse(key);
  const nodeMap = {};
  const dfs = (n = root) => {
    if (!n) return;
    if (n instanceof Array) {
      n.forEach(dfs);
      return;
    }
    if (n.type === 1) {
      // normal parameter
      nodeMap[n.value] = n.type;
      return;
    }
    if (n.type === 8) {
      // tag
      nodeMap[n.value] = n.type;
      dfs(n.children);
      return;
    }
    if (n.type === 5 || n.type === 6) {
      // select and plural
      nodeMap[n.value] = n.type;
      if (!n.options) return;
      Object.values(n.options).forEach((option) => dfs(option.value));
    }
  };
  dfs();
  return nodeMap;
};

module.exports = {
  collectVariableNodes,
};
