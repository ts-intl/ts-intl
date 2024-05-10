# All in one

## Start

```bash
pnpm i @ts-intl/eslint-plugin-ts-intl --save-dev
pnpm i eslint-plugin-jsonc --save-dev
pnpm i @ts-intl/integration
npx ts-intl-integrate
```

config entries, locale folder and supported languages in `ts-intl.config.json`

## Build your project

```bash
npx ts-intl-cache # generate i18n deps first
pnpm build # your build command
```

**remember add cache file to `.gitignore`**

## Choose a translate func

install translation packages your prefer, like `next-intl`

required interfaces:

```ts
type IntlProvider = ({ defaultLanguage, currentLanguage, dictionary, children }) => ReactNode

interface TSignature {
  (key, vars?: any) => string,
  rich: (key, vars?: any) => ReactNode,
}

type UseTranslations => () => TSignature
```

example:

```tsx
const t = useTranslations();
t('namespace A.module A.hello world!');
t.rich('namespace A.module A.hello <b>world</b>!', {
  b: (child) => <b>{child}</b>,
});
```

## SSG runtime (`nextjs`)

when `nextConfig.output === 'export'`, next do not support built-in `nextConfig.i18n`, to enable i18n:

pages structure:

```
pages
  - pageA.ts
  - [lang]
    - pageA.ts
```

`@ts-intl/integration` provider runtime utils to hide complexity

```ts
import { IntlUtilsBrowser } from '@ts-intl/integration';
const intlUtilsBrowser = new IntlUtilsBrowser(languageConfig);
```

default `useRouter` or `router`:

```tsx
const {
  pathname, // /[lang]/pageA/[paramA]
  asPath, // /ko/pageA/paramA?a=b
  locale, // undefined
} = useRouter();
```

after enhanced:

```ts
const router = useRouter();
const enhancedRouter = intlUtilsBrowser.enhanceRouter(router);
const {
  pathname, // /pageA/[paramA]
  asPath, // /pageA/paramA?a=b
  locale, // ko
} = enhancedRouter;
```

`enhancedRouter.push`, `enhancedRouter.replace`, **only support page path as pathname, do not support external and as**

```tsx
// wrong!
enhancedRouter.push('/pageA/paramA');
enhancedRouter.push('/[lang]/pageA/paramA');

// accept
enhancedRouter.push('/pageA/staticA');
enhancedRouter.push({
  pathname: '/pageA/[paramA]'
  query: {
    paramA: 'paramA',
    queryA: 'queryA'
  },
}, {
  locale: 'ko'
});
```

## SSG/SSR build

### Build time utils

```ts
import { IntlUtilsServer } from '@ts-intl/integration';
import { resolve } from 'path';
import { languageConfig } from './config';

const intlUtilsServer = new IntlUtilsServer(languageConfig);

export const getStaticPathsWithI18n = intlUtilsServer.getStaticPaths;

type GetDepsProps = Parameters<typeof intlUtilsServer.withI18nDeps>;
export const withI18nDeps = (props: Omit<GetDepsProps[0], 'project'>, mode: GetDepsProps[1] = 'ssg') =>
  intlUtilsServer.withI18nDeps(
    {
      ...props,
      rootDir: resolve(__dirname, '../../../'), // config your rootDir
      isEntryDepsEnabled: process.env.NODE_ENV === 'production',
    },
    mode,
  );
```

### SSG

`pages/[lang]/pageA.ts`:

```ts
export const getStaticPaths = getStaticPathsWithI18n;

export const getStaticProps: GetStaticProps = async (ctx) => {
  const getDeps = withI18nDeps(
    {
      // production mode
      // automatically collect depended keys
      // for dictionary extraction and optimization
      entry: 'src/pages/[lang]/pageA.ts',

      // development mode
      // for dictionary extraction
      ns: {
        include: ['common'],
      },
    },
    'ssg', // get locale from ctx.params?.[languageConfig.languageParamName]
  );
  return {
    props: {
      ...(await getDeps(ctx)),
    },
  };
};
```

### SSR

`pages/pageA.ts`:

```ts
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const getDeps = withI18nDeps(
    {
      entry: 'src/pages/pageA.ts',
      ns: {
        include: ['common'],
      },
    },
    'ssr', // get locale from ctx.locale
  );
  return {
    props: {
      ...(await getDeps(ctx)),
    },
  };
};
```

## Eslint

`.eslintrc.js`

```json
{
  "extends": ["./ts-intl.eslintrc.js"]
}
```

## Unused keys

```bash
npx ts-intl-unused
```
