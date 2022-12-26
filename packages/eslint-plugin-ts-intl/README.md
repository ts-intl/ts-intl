## eslint-plugin-ts-intl

ESLint plugin for `js/ts/jsx/tsx`, improving stability and efficiency of I18N project.

> best fit [next-intl](https://github.com/amannn/next-intl), also work well with other i18n plugins like [i18next](https://www.i18next.com/) and custom translation methods etc.

## Installation

```bash
npm install --save-dev @ts-intl/eslint-plugin-ts-intl
```

## Rules

### @ts-intl/ts-intl/no-dynamic-keys

Disallow localization dynamic keys at localization methods.

> Why: Easier to track.

```ts
const rule = {
  '@ts-intl/ts-intl/no-dynamic-keys': [
    'error',
    {
      funcNamePattern: '^(t|\\$t)$', // t('keyA')
      hookNamePattern: '^useTranslations$', // useTranslations()('keyA')
      richNamePattern: '^rich$', // t.rich('keyA')
    },
  ],
};
```

```ts
useTranslations()('keyA'); // good
useTranslations()(keyA); // error
```

### @ts-intl/ts-intl/no-mismatch-t

Disallow mismatch translation method name.

> Why: Easier to track.

```ts
const rule = {
  '@ts-intl/ts-intl/no-mismatch-t': [
    'error',
    {
      funcNamePattern: '^(t|\\$t)$',
      hookNamePattern: '^useTranslations$',
    },
  ],
};
```

```ts
const t = useTranslations(); // good
const tt = useTranslations(); // error
```

### @ts-intl/ts-intl/no-nested-call

Disallow nested translation method calls.

> Why: There are differences of translation between languages, the best practice is treating phrase as a whole.

```ts
const rule = {
  '@ts-intl/ts-intl/no-nested-call': [
    'error',
    {
      ...intlCommonConfig,
    },
  ],
};
```

```ts
const t = useTranslation();
t('a {animal}', {
  animal: t('dog'), // error
});
t('a dog'); // good
t('a cat'); // good
```

### @ts-intl/ts-intl/no-namespace-hooks

Disallow localization hook(or translation method factory) call with namespace.

> Why: pure translation method calling is easier to track and do some automation.

```ts
const rule = {
  '@ts-intl/ts-intl/no-namespace-hooks': [
    'error',
    {
      hookNamePattern: '^useTranslations|tFactory$',
    },
  ],
};
```

```ts
useTranslation()('global.keyA'); // good
useTranslation('global')('keyA'); // error
```

### @ts-intl/ts-intl/no-forbidden-keys

Disallow localization forbidden keys.

> Why: Avoid using reserved words.

```ts
const rule = {
  '@ts-intl/ts-intl/no-forbidden-keys': [
    'error',
    {
      funcNamePattern: '^(t|\\$t)$',
      hookNamePattern: '^useTranslations$',
      richNamePattern: '^rich$',
      forbiddenPattern: ':',
    },
  ],
};
```

```ts
useTranslation()('global.keyA'); // good
useTranslation()('global.key:A'); // error
```

### @ts-intl/ts-intl/no-invalid-keys

Disallow localization missing/invalid keys.

```ts
const rule = {
  '@ts-intl/ts-intl/no-invalid-keys': [
    'error',
    {
      funcNamePattern: '^(t|\\$t)$',
      hookNamePattern: '^useTranslations$',
      richNamePattern: '^rich$',
      namespaceDivider: '.',
      keyDivider: '.',
      fullPath: '/src/locales',
      locale: 'en',
      fallbackNamespace: 'common',
    },
  ],
};
```

```ts
// locale directory structure:
// /src/locales/en/common
// /src/locales/en/global
// common: { keyA: 'keyA', keyC: { keyD: 'keyD' } }

t('keyA'); // error: missing namespace, auto prepend a namespace if keyA exist in it, otherwise prepend fallbackNamespace
t('common.keyB'); // error: key do not exist in locale
t('other.keyA'); // error: namespace do not exist in locale
t('common.keyA'); // error: value of key is empty string
```

### @ts-intl/ts-intl/no-raw-text

Detect potential natural language which need to be translated.

```ts
const rule = {
  '@ts-intl/ts-intl/no-raw-text': [
    'warn',
    {
      funcNamePattern: '^(t|\\$t)$', // ignore the phrases in t call
      hookNamePattern: '^useTranslations$', // ignore the phrases in t factory call
      richNamePattern: '^rich$', //  // ignore the phrases in t.rich call
      include: {
        body: '\\/ui\\/src', // path pattern, which files should be detected
        flags: 'i', // RegExp flags
      },
      exclude: [
        {
          body: '\\.test\\.tsx?', // path pattern, ignore file paths
        },
      ],
      matchedPattern: '[a-zA-Z]{2,}', // test phrases which need to be translated
      ignoreNodes: [
        {
          type: 'JSXAttribute',
          body: getPatternByArr(matchedJSXAttrs, true), // normally we ignore most JSXAttribute except title/desc/name etc.
          flags: 'i',
        },
        {
          type: 'Property',
          body: getPatternByArr(ignoreCustomProperties),
          flags: 'i',
        },
        {
          type: 'Property',
          body: getPatternByArr(ignoreCSSProperties),
        },
        {
          type: 'Property,VariableDeclarator,AssignmentPattern',
          body: getPatternByArr(ignoreIndexNames),
          flags: 'i',
        },
        {
          type: 'CallExpression',
          body: getPatternByArr(ignoreCallNames),
        },
      ],
      ignoreTexts: [
        {
          body: getPatternByArr(ignoreCSSTexts),
        },
        {
          body: getPatternByArr(ignoreReservedWords),
        },
        {
          body: getPatternByArr(ignoreUrlPatterns),
        },
      ],
    },
  ],
};
```

### @ts-intl/ts-intl/syntax-icu-ts

Disallow not icu style keys. Open this rule when using [ICU Message syntax](https://unicode-org.github.io/icu/userguide/format_parse/messages/).

```ts
const rule = {
  '@ts-intl/ts-intl/syntax-icu-ts': [
    'error',
    {
      funcNamePattern: '^(t|\\$t)$',
      hookNamePattern: '^useTranslations$',
      richNamePattern: '^rich$',
      namespaceDivider: '.',
      keyDivider: '.',
      fullPath: '/src/locales',
      locale: 'en',
    },
  ],
};
```

```ts
t('common.a {animal}', { animal: 'dog' }); // good
t('common.a {animal}'); // error, missing animal parameter

t.rich('common.a <blue>bird</blue>'); // error, missing blue renderer

t('common.a <blue>bird</blue>', {
  // error, should use t.rich
  blue: (child) => child,
});
```

### @ts-intl/ts-intl/no-missing-keys-in-other-locales

Disallow missing keys in other locales.

```ts
const eslintConfig = {
  overrides: [
    {
      files: ['*.json', '*.json5'],
      parser: 'jsonc-eslint-parser',
      parserOptions: {
        jsonSyntax: 'JSON',
      },
      rules: {
        '@ts-intl/ts-intl/no-missing-keys-in-other-locales': [
          'warn',
          {
            fullPath: '/src/locales',
            locale: 'en',
            otherLocales: ['fr'],
            keyDivider: '.',
            namespaceDivider: '.',
          },
        ],
      },
    },
  ],
};
```

```json
// en
{
  "a": "a",
  "b": "b", // warning
}
// fr
{
  "a": "a",
}
```

### @ts-intl/ts-intl/syntax-icu-json

Disallow not icu style key-value in json. Open this rule when using [ICU Message syntax](https://unicode-org.github.io/icu/userguide/format_parse/messages/).

```ts
const eslintConfig = {
  overrides: [
    {
      files: ['*.json', '*.json5'],
      parser: 'jsonc-eslint-parser',
      parserOptions: {
        jsonSyntax: 'JSON',
      },
      rules: {
        '@ts-intl/ts-intl/syntax-icu-json': [
          'error',
          {
            fullPath: '/src/locales',
            locale: 'en',
            forbiddenPattern: '\\.',
          },
        ],
      },
    },
  ],
};
```

```json
{
  "a.1": "a", // error
  "a2": "a </>" // error
}
```
