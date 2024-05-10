import { Project } from '@ts-intl/shared';

import {
  getPatternByArr,
  ignoreCallNames,
  ignoreCSSProperties,
  ignoreCSSTexts,
  ignoreCustomProperties,
  ignoreFiles,
  ignoreIndexNames,
  ignoreReservedWords,
  ignoreUrlPatterns,
  matchedJSXAttrs,
  matchedPattern,
} from './config';

export const getNoRawRule = (
  {
    rootDir,
    entry = '\\/ui\\/src',
  }: {
    rootDir: string;
    entry: string;
  },
  configs?: {
    ignoreCallNames?: string[];
    ignoreCSSProperties?: string[];
    ignoreCSSTexts?: string[];
    ignoreCustomProperties?: string[];
    ignoreFiles?: string[];
    ignoreIndexNames?: string[];
    ignoreReservedWords?: string[];
    ignoreUrlPatterns?: string[];
    matchedJSXAttrs?: string[];
    matchedPattern?: string;
  },
) => {
  const project = Project.getSingleton(rootDir);
  return {
    rules: {
      '@ts-intl/ts-intl/no-raw-text': [
        'warn',
        {
          ...project.projectConfig.integration,
          include: {
            body: entry,
          },
          exclude: [
            {
              body: [...ignoreFiles, ...(configs?.ignoreFiles ?? [])].join('|'),
            },
          ],
          matchedPattern: configs?.matchedPattern ?? matchedPattern,
          ignoreNodes: [
            {
              type: 'JSXAttribute',
              body: getPatternByArr(
                matchedJSXAttrs,
                configs?.matchedJSXAttrs,
                true,
              ),
              flags: 'i',
            },
            {
              type: 'Property',
              body: getPatternByArr(
                ignoreCustomProperties,
                configs?.ignoreCustomProperties,
              ),
              flags: 'i',
            },
            {
              type: 'Property',
              body: getPatternByArr(
                ignoreCSSProperties,
                configs?.ignoreCSSProperties,
              ),
            },
            {
              type: 'Property,VariableDeclarator,AssignmentPattern',
              body: getPatternByArr(
                ignoreIndexNames,
                configs?.ignoreIndexNames,
              ),
              flags: 'i',
            },
            {
              type: 'CallExpression',
              body: getPatternByArr(ignoreCallNames, configs?.ignoreCallNames),
            },
          ],
          ignoreTexts: [
            {
              body: getPatternByArr(ignoreCSSTexts, configs?.ignoreCSSTexts),
            },
            {
              body: getPatternByArr(
                ignoreReservedWords,
                configs?.ignoreReservedWords,
              ),
            },
            {
              body: getPatternByArr(
                ignoreUrlPatterns,
                configs?.ignoreUrlPatterns,
              ),
            },
          ],
        },
      ],
    },
  };
};
