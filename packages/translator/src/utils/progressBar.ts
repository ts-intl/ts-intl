import colors from 'ansi-colors';
import cliProgress from 'cli-progress';

export const createProgressBar = (
  opts: Record<
    string,
    {
      total: number;
    }
  >
) => {
  const bar = new cliProgress.MultiBar({
    format: `Generation Progress | {locale} | ${colors.cyan(
      '{bar}'
    )} | {percentage}% || {value}/{total} Succeed | {failed} Failed`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });
  return {
    bar,
    bars: Object.fromEntries(
      Object.entries(opts).map(([locale, { total }]) => [
        locale,
        bar.create(total, 0, { locale }),
      ])
    ),
  };
};
