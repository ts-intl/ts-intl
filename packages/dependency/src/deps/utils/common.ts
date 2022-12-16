const calcAddition = (origin: string[], target: string[]) => {
  const map = Object.fromEntries(origin.map((v) => [v, true]));
  return target.filter((v) => !map[v]);
};

export const calcDiff = (origin: string[], target: string[]) => {
  return {
    added: calcAddition(origin, target),
    removed: calcAddition(target, origin),
  };
};
