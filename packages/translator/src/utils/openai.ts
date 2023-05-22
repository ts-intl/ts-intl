import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';

import { CompletionMsg, ProjectConfig } from '../types';

export const initApi = (apiKey?: string) => {
  if (!apiKey) return;
  return new OpenAIApi(
    new Configuration({
      apiKey,
    })
  );
};

export const getCompletion = async (
  instance: OpenAIApi,
  msg: CompletionMsg,
  opts?: ProjectConfig['completionOptions']
): Promise<{
  data?: Awaited<ReturnType<OpenAIApi['createChatCompletion']>>['data'];
  error?: unknown;
}> => {
  try {
    const { data } = await instance.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        max_tokens: 1000,
        messages: [...combineContexts(opts?.preset), parseMsg(msg)],
      },
      {
        timeout: 30000,
      }
    );
    return {
      data,
    };
  } catch (error) {
    return { error };
  }
};

const combineContexts = (
  preset: NonNullable<ProjectConfig['completionOptions']>['preset'] = {}
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
