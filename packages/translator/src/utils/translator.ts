import { extractDictionary } from '@ts-intl/dictionary';
import { Dictionary } from '@ts-intl/shared';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { stringify } from 'safe-stable-stringify';

import { readConfig, ROOT_PATH } from '../configs';
import { ProjectConfig } from '../types';
import {
  extractMissingPairs,
  getControllers,
  getParentOfLeave,
  parsePath,
} from './controller';

export class Translator {
  public projectConfig: ProjectConfig;
  public baseController: ReturnType<typeof getControllers>[0];
  public otherControllers: ReturnType<typeof getControllers>;
  public missing: ReturnType<typeof extractMissingPairs>;
  public translated: Record<string, Dictionary>;

  constructor() {
    this.projectConfig = readConfig();
    this.projectConfig.path = join(ROOT_PATH, this.projectConfig.path);
    const controllers = getControllers(this.projectConfig);
    this.missing = extractMissingPairs(this.projectConfig, controllers);
    this.baseController = controllers[0];
    this.otherControllers = controllers.slice(1);

    const include = Object.keys(this.baseController.controller.dictionary);
    this.translated = Object.fromEntries(
      this.otherControllers.map(({ controller, locale }) => [
        locale,
        extractDictionary(
          controller.dictionary,
          this.baseController.controller.dictionary,
          include
        ),
      ])
    );
  }

  updateTranslated(
    locale: string,
    path: string,
    value: string,
    removeEmpty = false
  ) {
    const dict = this.translated[locale];
    const { parent, key } = getParentOfLeave(
      dict,
      parsePath(
        path,
        this.projectConfig.nsDivider,
        this.projectConfig.keyDivider
      )
    );
    if (removeEmpty && !value) {
      delete parent[key];
    } else {
      parent[key] = value;
    }
  }

  write() {
    return Promise.all(
      Object.entries(this.translated).map(([locale, dict]) =>
        Promise.all(
          Object.entries(dict).map(async ([namespace, child]) => {
            const directory = join(this.projectConfig.path, locale);
            await mkdir(directory, { recursive: true });
            return writeFile(
              join(directory, `${namespace}.json`),
              stringify(child, undefined, 2)
            );
          })
        )
      )
    );
  }
}
