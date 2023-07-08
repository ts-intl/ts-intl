import { extractDictionary } from '@ts-intl/dictionary';
import { Dictionary, Project } from '@ts-intl/shared';
import { writeFileWithDetection } from '@ts-intl/shared/dist/esm/fs';
import { join } from 'path';
import { stringify } from 'safe-stable-stringify';

import {
  extractMissingPairs,
  getControllers,
  getParentOfLeave,
  parsePath,
} from './controller';

export class Translator {
  public project: Project;
  public baseController: ReturnType<typeof getControllers>[0];
  public otherControllers: ReturnType<typeof getControllers>;
  public missing: ReturnType<typeof extractMissingPairs>;
  public translated: Record<string, Dictionary>;

  constructor() {
    this.project = new Project();
    const controllers = getControllers(this.project.projectConfig);
    this.missing = extractMissingPairs(this.project.projectConfig, controllers);
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
        this.project.projectConfig.syntax.nsDivider,
        this.project.projectConfig.syntax.keyDivider
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
            const directory = join(
              this.project.projectConfig.path.dictionary,
              locale
            );
            await writeFileWithDetection(
              join(directory, `${namespace}.json`),
              stringify(child, undefined, 2),
              true
            );
          })
        )
      )
    );
  }
}
