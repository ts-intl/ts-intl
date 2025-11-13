# AI Translator

This repo is to maintain locale files by automatically translate untranslated locales which powered by [openai](https://platform.openai.com/docs/models/gpt-3-5).

## Why Use AI

We use AI to translate the locale files, because it's hard to find a human translator who can translate all the locale files of all the projects.

Try it if you have very limited budget (translators and lokalise accounts)!

## Install

```bash
pnpm i @ts-intl/translator
```

## Usages

Initialize config and git flow files of translator:

```bash
npx ts-intl-init-translator
```

Generate translations manually:

```bash
npx ts-intl-translate
```

or

```bash
npx ts-intl-translate --env=production
```

Coding:

```typescript
import { translate } from '@ts-intl/translator';

await translate();
```

## Locales Structure Required

```
.
├── yourRepo
│   ├── yourLocalesPath
│   │   ├── en
│   │   │   └── namespace1.json
│   │   └── [other]
```

- **yourLocalesPath**: The locale directory entry of yourRepo.
- **en ([Language Code or Language ID](https://www.science.co.il/language/Locale-codes.php))**: The English locale entry of project1.
- **[other] ([Language Code or Language ID](https://www.science.co.il/language/Locale-codes.php))**: The [other] (it, zh, it-it, etc...) locale entry of project1.
- **namespace1.json**: The namespace (to split large file) entry of project1.

## Git Flow

> **Change the `.github/workflows/translator-shared.yml` or `.github/workflows/translator-flow.yml` in your repo if needed.**

Add or update your locale files (in `[yourLocalesPath]`), then commit and push to remote.

Then the automatic translation will be triggered, and you can check the translation status on **Github Actions**.

The action would add commit `feat: [AI Generated] translations` to your branch. Which includes the AI generated translations.

## Environment Variables

To enable AI translation:

- Setup `process.env.OPENAI_API_KEY`, `process.env.OPENAI_API_BASE_PATH`, `process.env.OPENAI_MODEL`.
- Create `.env.development` and `.env.production` with:

```env
OPENAI_API_KEY=you-api-key # sk-xxxx

OPENAI_API_BASE_PATH=your-api-base-path # optional
OPENAI_MODEL=your-model # optional
```

- Setup `secrets.OPENAI_API_KEY` and others of your Github repo.

## `ts-intl-translator.config.json`

```ts
type ProjectConfig
```

Supported syntax list:

1. [icu](https://unicode-org.github.io/icu/userguide/format_parse/messages/), another simple doc from [formatjs](https://formatjs.io/docs/core-concepts/icu-syntax/).

`descriptions`:

Provide the descriptions of the keys (optional), which will help AI generate more accurate translations.

```json
{
  "ns1.key1.key2.key3": "description of ns1.key1.key2.key3"
}
```

Sample:

```json
// ./yourLocalesPath/en/ns1.json
{
  "key1": {
    "key2": {
      "key3": "Bob, Hello World!"
    }
  },
  "key4": "Minted is awesome!"
}
```

When `nsDivider` is `"."`, `keyDivider` is `"."`

```json
{
  "descriptions": {
    "ns1.key1.key2.key3": "Bob is my best friend",
    "ns1.key4": "Minted is a NFT trading platform"
  }
}
```

When `nsDivider` is `":"`, `keyDivider` is `"."`

```json
{
  "descriptions": {
    "ns1:key1.key2.key3": "Bob is my best friend",
    "ns1:key4": "Minted is a NFT trading platform"
  }
}
```

## IMPORTANT

Only auto-translate those missing or empty values, which means manually added values would always reserve.

This strategy allow us to:

- Add **Reserved Words**, like "Hello World".
- Add **Proper Nouns**, like brands and guide links.
- **Override** AI translations.
