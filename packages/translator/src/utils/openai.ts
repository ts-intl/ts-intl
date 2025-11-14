import { ProjectConfig } from '@ts-intl/shared';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';

import { CompletionMsg } from '../types';

export const initApi = (apiKey?: string, basePath?: string) => {
  if (!apiKey) return;
  return new OpenAIApi(
    new Configuration({
      apiKey,
      basePath,
    }),
  );
};

/**
 * Parse AI response content, supporting multiple formats
 * Priority order: JSON > JSON in Markdown code blocks > Plain text
 */
export const parseResponseContent = (
  content: string,
): { translation: string; note?: string } => {
  if (!content || content.trim() === '' || content === 'undefined') {
    console.log('⚠️ Response content is empty or invalid');
    return { translation: '' };
  }

  console.log(
    '🔍 Start parsing response content:',
    content.substring(0, 200) + '...',
  );

  // 1. Try to parse as JSON
  try {
    const parsed = JSON.parse(content.trim());
    console.log('✅ Successfully parsed as direct JSON:', parsed);
    return {
      translation: parsed.translation || parsed.content || '',
      note: parsed.note,
    };
  } catch (e) {
    console.log('📝 Direct JSON parsing failed, trying other formats');
  }

  // 2. Try to extract JSON from Markdown code blocks
  const jsonBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1].trim());
      console.log(
        '✅ Successfully extracted JSON from Markdown code block:',
        parsed,
      );
      return {
        translation: parsed.translation || parsed.content || '',
        note: parsed.note,
      };
    } catch (e) {
      console.log('❌ Failed to parse JSON from Markdown:', e);
    }
  }

  // 3. Try to extract quoted content
  const quotedMatch = content.match(/"([^"]+)"/);
  if (quotedMatch) {
    console.log('✅ Successfully extracted quoted content:', quotedMatch[1]);
    return { translation: quotedMatch[1] };
  }

  // 4. Translate the entire response (remove extraneous whitespace)
  const cleanContent = content.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');
  console.log('📄 Using cleaned plain text content:', cleanContent);
  return { translation: cleanContent };
};

export const getCompletion = async (
  instance: OpenAIApi,
  msg: CompletionMsg,
  opts?: NonNullable<ProjectConfig['translator']>['completionOptions'],
): Promise<{
  data?: Awaited<ReturnType<OpenAIApi['createChatCompletion']>>['data'];
  error?: unknown;
}> => {
  try {
    const { data } = await instance.createChatCompletion(
      {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        max_tokens: 1000,
        messages: [...combineContexts(opts?.preset), parseMsg(msg)],
      },
      {
        timeout: 30000,
      },
    );
    return {
      data,
    };
  } catch (error) {
    return { error };
  }
};

const combineContexts = (
  preset: NonNullable<
    NonNullable<ProjectConfig['translator']>['completionOptions']
  >['preset'] = {},
): ChatCompletionRequestMessage[] => {
  const { override, presets = [] } = preset;
  const context = override ? [] : [CONTEXT_1, CONTEXT_2];
  return [...context, ...presets];
};

const parseMsg = (msg: CompletionMsg): ChatCompletionRequestMessage => ({
  role: 'user',
  content: JSON.stringify(msg),
});

const CONTEXT_1: ChatCompletionRequestMessage = {
  role: 'system',
  content: `
  You are a translator who follow the ICU message syntax.

  You would receive a JSON object with the structure delimited by third backticks:
  \`\`\`
  {
    "locale": string, // language code which you should translate to
    "content": string, // English ICU message
    "description": string, // the description of the content to make better translation
  }
  \`\`\`


  Before you return the answer, you should re-translate until meaning of the translation and the content are the same.

  Do not include any explanations or notes.

  Only provide a RFC8259 compliant JSON response with the following structure delimited by third backticks:
  \`\`\`
  {
    "translation": string, // a translated ICU message
    "note": string, // the extra note to explain how you translate (optional)
  }
  \`\`\`
`,
};

const CONTEXT_2: ChatCompletionRequestMessage = {
  role: 'system',
  content: `
  Do not translate https links.
`,
};
