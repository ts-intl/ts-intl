import { Rule } from 'eslint';
import type { JSONSchema4 } from 'json-schema';

export const createRule = (rule: Rule.RuleModule) => {
  return rule;
};

export const defaultSchemaProperties = {
  funcNamePattern: {
    type: 'string',
  },
  hookNamePattern: {
    type: 'string',
  },
  richNamePattern: {
    type: 'string',
  },

  forbiddenPattern: {
    type: 'string',
  },

  nsDivider: {
    type: 'string',
  },
  keyDivider: {
    type: 'string',
  },

  fallbackNamespace: {
    type: 'string',
  },
  localePath: {
    type: 'string',
  },
  locale: {
    type: 'string',
  },

  others: {
    type: 'array',
    items: { type: 'string' },
  },

  matchedPattern: {
    type: 'string',
  },

  ignoreNodes: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        type: 'string',
        body: 'string',
        flags: 'string',
        additionalProperties: false,
      },
    },
  },

  ignoreTexts: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        body: 'string',
        flags: 'string',
        additionalProperties: false,
      },
    },
  },

  exclude: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        body: 'string',
        flags: 'string',
        additionalProperties: false,
      },
    },
  },
  include: {
    type: 'object',
    properties: {
      body: 'string',
      flags: 'string',
      additionalProperties: false,
    },
  },
};

export const getSchema = (keys: (keyof typeof defaultSchemaProperties)[]) => {
  const properties: Record<string, JSONSchema4> = {};
  keys.forEach((key) => {
    properties[key] = defaultSchemaProperties[key] as JSONSchema4;
  });
  return {
    schema: [
      {
        type: 'object',
        properties: properties,
        additionalProperties: false,
      } as JSONSchema4,
    ],
  };
};
