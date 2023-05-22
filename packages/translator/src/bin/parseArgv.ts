export const parseArgv = () => {
  const argv = process.argv.slice(2);
  const opts: { path?: string; env: 'development' | 'production' } = {
    env: 'development',
  };
  for (const arg of argv) {
    const [flag, value] = arg.split('=');
    switch (flag) {
      case '--path':
        opts.path = value;
        break;
      case '--env':
        opts.env = value === 'production' ? 'production' : 'development';
        break;
      default:
        break;
    }
  }
  return opts;
};
