import { OpenAIApi } from 'openai';

import { parseArgv } from './bin/parseArgv';
import { setupEnvVariables } from './bin/setupEnvVariables';
import { CompletionRes } from './types';
import { getCompletion, initApi } from './utils/openai';
import { createProgressBar } from './utils/progressBar';
import { Translator } from './utils/translator';

export const translate = async () => {
  setupEnvVariables(parseArgv().env);

  const api = initApi(process.env.OPENAI_API_KEY);

  const translator = new Translator();

  const { bar, bars } = createProgressBar(
    Object.fromEntries(
      Object.entries(translator.missing).map(([locale, items]) => [
        locale,
        { total: items.length },
      ])
    )
  );
  const failed = Object.fromEntries(
    Object.keys(translator.missing).map((locale) => [
      locale,
      {
        count: 0,
        addition: new Array<{
          error: unknown;
          path: string;
          content?: string;
          note?: string;
        }>(),
      },
    ])
  );
  const promises: Promise<void>[] = [];

  for (const [locale, items] of Object.entries(translator.missing)) {
    for (const { path, originalContent } of items) {
      promises.push(
        wrapCompletion({
          api,
          locale,
          originalContent,
          translator,
          path,
        }).then(({ content, error, note }) => {
          bar.log(path);
          if (error || !content) {
            failed[locale].count += 1;
            failed[locale].addition.push({
              content,
              error,
              note,
              path,
            });
            bars[locale].increment(0, { failed: failed[locale].count });
            translator.updateTranslated(locale, path, '', false);
          } else {
            bars[locale].increment(1, { failed: failed[locale].count });
            translator.updateTranslated(locale, path, content, false);
          }
        })
      );
    }
  }

  await Promise.all(promises);

  bar.stop();

  Object.entries(failed).forEach(([locale, { addition }]) => {
    addition.forEach(({ content, note, path, error }) => {
      const message = error instanceof Error ? error.message : error;
      console.log(
        `Failed | ${locale} | ${path} | ${content} | ${note} | ${message}`
      );
    });
  });

  translator.write();
};

const wrapCompletion = async ({
  api,
  locale,
  originalContent,
  translator,
  path,
}: {
  api?: OpenAIApi;
  locale: string;
  originalContent: string;
  translator: Translator;
  path: string;
}): Promise<{
  content?: string;
  error?: unknown;
  note?: string;
}> => {
  if (!api) {
    return {
      content: '',
    };
  }
  const { error, data } = await getCompletion(
    api,
    {
      locale,
      content: originalContent,
      description: translator.projectConfig.descriptions?.[path] ?? '',
    },
    translator.projectConfig.completionOptions
  );
  if (error || !data) {
    return {
      error,
    };
  }
  try {
    const parsed: CompletionRes = data.choices[0].message?.content
      ? JSON.parse(data.choices[0].message.content)
      : { translation: '' };
    return {
      content: parsed.translation,
      note: parsed.note,
    };
  } catch (error) {
    return {
      error,
      content: data.choices[0].message?.content,
    };
  }
};
