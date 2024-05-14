import { FixGetter } from './types';

export const fixImport: FixGetter = ({ fixer, opts, context }) => {
  const program = context.getSourceCode().ast;
  const fix = fixer.insertTextAfterRange(
    [0, 0],
    `import { ${opts.useTranslations} } from '${opts.package}';\n`,
  );
  for (const child of program.body) {
    if (child.type === 'ImportDeclaration') {
      if (child.source.value === opts.package) {
        for (const specifier of child.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.name === opts.useTranslations
          ) {
            return;
          }
        }
      }
    }
  }
  return fix;
};
